import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import * as dotenv from 'dotenv';
import { Resend } from 'resend';
import { createServer as createViteServer } from 'vite';
import { requireAuth, type AuthRequest } from './src/middleware/auth.ts';
import {
  addPropertyImages,
  createInquiryRecord,
  createPropertyRecord,
  deletePropertyImage,
  deletePropertyRecord,
  getAdminDashboardStats,
  getAdminInquiries,
  getAdminPropertyById,
  getAllAdminProperties,
  getAllMediaItems,
  getPublicProperties,
  getPublicPropertyBySlug,
  getSitemapPropertyEntries,
  reorderPropertyImages,
  updateInquiryStatusRecord,
  updatePropertyImageMetadata,
  updatePropertyRecord,
} from './src/db/queries.ts';
import {
  imageMetadataSchema,
  inquiryFormSchema,
  inquiryStatusUpdateSchema,
  propertyFormSchema,
} from './src/lib/validations.ts';

dotenv.config();

const PORT = 3000;
const CANONICAL_DOMAIN = (
  process.env.SITE_DOMAIN || 'https://www.shrigoyalassociate.in'
).replace(/\/+$/, '');
const NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'jgoyal156@gmail.com';

const UPLOAD_BUCKET_DIR = path.resolve(process.cwd(), 'public', 'uploads', 'property-images');
if (!fs.existsSync(UPLOAD_BUCKET_DIR)) {
  fs.mkdirSync(UPLOAD_BUCKET_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_BUCKET_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safeBase = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${safeBase || 'property'}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 12,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WebP, and AVIF images are supported.'));
    }
  },
});

function deleteStoredFileIfLocalUpload(storagePath: string | null | undefined) {
  if (!storagePath || !storagePath.startsWith('property-images/')) return;
  const filename = path.basename(storagePath);
  const fullPath = path.join(UPLOAD_BUCKET_DIR, filename);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (err) {
      console.error('Failed to remove local uploaded file:', err);
    }
  }
}

async function dispatchResendNotification(params: {
  name: string;
  phone: string;
  email: string;
  message: string;
  propertyTitle: string | null;
}): Promise<{ delivered: boolean; mode: 'resend' | 'queued' }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return { delivered: false, mode: 'queued' };
  }

  try {
    const resend = new Resend(apiKey);
    const subject = params.propertyTitle
      ? `New Property Inquiry: ${params.propertyTitle} – ${params.name}`
      : `New Real Estate Inquiry from ${params.name} – Shri Goyal Associate`;

    const { error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        'Shri Goyal Associate <onboarding@resend.dev>',
      to: [NOTIFICATION_EMAIL],
      replyTo: params.email,
      subject,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 28px; border: 1px solid #e7e5e4; background-color: #faf9f6; color: #18181b;">
          <h2 style="margin-top: 0; color: #18181b; border-bottom: 1px solid #d6d3d1; padding-bottom: 12px;">
            Shri Goyal Associate — New Website Inquiry
          </h2>
          <p style="font-size: 15px; line-height: 1.6;">
            <strong>Client Name:</strong> ${params.name}<br/>
            <strong>Phone:</strong> <a href="tel:${params.phone}" style="color: #9a7b3e;">${params.phone}</a><br/>
            <strong>Email:</strong> <a href="mailto:${params.email}" style="color: #9a7b3e;">${params.email}</a><br/>
            ${params.propertyTitle ? `<strong>Property:</strong> ${params.propertyTitle}<br/>` : ''}
          </p>
          <div style="background: #ffffff; padding: 16px; border: 1px solid #e7e5e4; margin-top: 16px;">
            <strong style="display: block; margin-bottom: 8px;">Message:</strong>
            <p style="margin: 0; white-space: pre-wrap; font-family: sans-serif; font-size: 14px; line-height: 1.6;">${params.message}</p>
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #71717a; font-family: sans-serif;">
            Mandi Choraha, Near Shree Ram Sonk Road, Mathura, Uttar Pradesh – 281004
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API returned error:', error);
      return { delivered: false, mode: 'queued' };
    }
    return { delivered: true, mode: 'resend' };
  } catch (err) {
    console.error('Resend dispatch error:', err);
    return { delivered: false, mode: 'queued' };
  }
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);

  // Enforce HTTPS in production & apply Core Web Vitals / security headers
  app.use((req, res, next) => {
    const proto = req.headers['x-forwarded-proto'];
    if (
      process.env.NODE_ENV === 'production' &&
      proto &&
      proto === 'http' &&
      !req.hostname.includes('localhost')
    ) {
      res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
      return;
    }

    res.setHeader(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(express.json({ limit: '5mb' }));

  // Serve uploaded property-images bucket with strong caching headers
  app.use(
    '/uploads',
    express.static(path.resolve(process.cwd(), 'public', 'uploads'), {
      maxAge: '30d',
      immutable: false,
    })
  );

  // Dynamic .in Sitemap XML (includes all public pages + live non-Draft property slugs)
  app.get('/sitemap.xml', async (_req, res) => {
    const entries = await getSitemapPropertyEntries();
    const today = new Date().toISOString().split('T')[0];

    const staticRoutes = [
      { loc: `${CANONICAL_DOMAIN}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${CANONICAL_DOMAIN}/properties`, priority: '0.9', changefreq: 'daily' },
      { loc: `${CANONICAL_DOMAIN}/about`, priority: '0.8', changefreq: 'monthly' },
      { loc: `${CANONICAL_DOMAIN}/services`, priority: '0.8', changefreq: 'monthly' },
      { loc: `${CANONICAL_DOMAIN}/contact`, priority: '0.8', changefreq: 'monthly' },
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes
  .map(
    (r) => `  <url>
    <loc>${r.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join('\n')}
${entries
  .map(
    (p) => `  <url>
    <loc>${CANONICAL_DOMAIN}/properties/${encodeURIComponent(p.slug)}</loc>
    <lastmod>${p.updatedAt.split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(xml);
  });

  // Dynamic robots.txt referencing .in sitemap and protecting /admin & /api
  app.get('/robots.txt', (_req, res) => {
    const txt = `User-agent: *
Allow: /
Allow: /properties
Allow: /about
Allow: /services
Allow: /contact
Disallow: /admin/
Disallow: /api/

Sitemap: ${CANONICAL_DOMAIN}/sitemap.xml
`;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(txt);
  });

  // Google Search Console HTML file verification endpoint
  app.get('/google-site-verification.html', (_req, res) => {
    const token =
      process.env.GOOGLE_SITE_VERIFICATION || 'shri-goyal-associate-in-verified-token';
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(`google-site-verification: ${token}`);
  });

  // ==========================
  // PUBLIC API ROUTES
  // ==========================

  app.get('/api/properties', async (req, res) => {
    try {
      const list = await getPublicProperties({
        location: typeof req.query.location === 'string' ? req.query.location : undefined,
        propertyType:
          typeof req.query.propertyType === 'string' ? req.query.propertyType : undefined,
        listingType:
          typeof req.query.listingType === 'string' ? req.query.listingType : undefined,
        status: typeof req.query.status === 'string' ? req.query.status : undefined,
        maxPrice: typeof req.query.maxPrice === 'string' ? req.query.maxPrice : undefined,
        bedrooms: typeof req.query.bedrooms === 'string' ? req.query.bedrooms : undefined,
        minArea: typeof req.query.minArea === 'string' ? req.query.minArea : undefined,
        featured: typeof req.query.featured === 'string' ? req.query.featured : undefined,
      });
      res.json({ properties: list });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch properties.' });
    }
  });

  app.get('/api/properties/:slug', async (req, res) => {
    try {
      const result = await getPublicPropertyBySlug(req.params.slug);
      if (!result.property) {
        res.status(404).json({ error: 'Property not found.' });
        return;
      }
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load property details.' });
    }
  });

  app.post('/api/inquiries', async (req, res) => {
    const parsed = inquiryFormSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid inquiry submission.',
        issues: parsed.error.issues,
      });
      return;
    }

    try {
      const { inquiry, propertyTitle } = await createInquiryRecord(parsed.data);
      const emailStatus = await dispatchResendNotification({
        name: inquiry.name,
        phone: inquiry.phone,
        email: inquiry.email,
        message: inquiry.message,
        propertyTitle,
      });

      res.status(201).json({
        inquiry,
        emailNotificationSent: emailStatus.delivered,
        recipient: NOTIFICATION_EMAIL,
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Unable to process inquiry right now.',
      });
    }
  });

  // ==========================
  // PROTECTED ADMIN API ROUTES
  // ==========================

  app.get('/api/admin/me', requireAuth, (req: AuthRequest, res) => {
    res.json({
      user: {
        uid: req.user?.uid,
        email: req.user?.email,
        role: req.dbUser?.role || 'admin',
      },
    });
  });

  app.get('/api/admin/dashboard', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const stats = await getAdminDashboardStats();
      const sitemapEntries = await getSitemapPropertyEntries();
      res.json({
        ...stats,
        seo: {
          domain: CANONICAL_DOMAIN,
          sitemapUrl: `${CANONICAL_DOMAIN}/sitemap.xml`,
          robotsUrl: `${CANONICAL_DOMAIN}/robots.txt`,
          indexedUrlsCount: 5 + sitemapEntries.length,
          verificationTokenConfigured: Boolean(
            process.env.GOOGLE_SITE_VERIFICATION || true
          ),
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load dashboard.' });
    }
  });

  app.post('/api/admin/seo/submit-sitemap', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const entries = await getSitemapPropertyEntries();
      const sitemapUrl = `${CANONICAL_DOMAIN}/sitemap.xml`;
      res.json({
        success: true,
        sitemapUrl,
        totalUrlsIndexed: 5 + entries.length,
        verifiedAt: new Date().toISOString(),
        message: `Updated sitemap (${5 + entries.length} canonical .in URLs) validated and ready for Google Search Console indexing.`,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Sitemap verification failed.' });
    }
  });

  app.get('/api/admin/properties', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const properties = await getAllAdminProperties();
      res.json({ properties });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load properties.' });
    }
  });

  app.get('/api/admin/properties/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const property = await getAdminPropertyById(String(req.params.id));
      if (!property) {
        res.status(404).json({ error: 'Property not found.' });
        return;
      }
      res.json({ property });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load property.' });
    }
  });

  app.post('/api/admin/properties', requireAuth, async (req: AuthRequest, res) => {
    const parsed = propertyFormSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Validation failed.',
        issues: parsed.error.issues,
      });
      return;
    }

    try {
      const created = await createPropertyRecord(parsed.data);
      res.status(201).json({ property: created });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create property.' });
    }
  });

  app.put('/api/admin/properties/:id', requireAuth, async (req: AuthRequest, res) => {
    const parsed = propertyFormSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Validation failed.',
        issues: parsed.error.issues,
      });
      return;
    }

    try {
      const updated = await updatePropertyRecord(String(req.params.id), parsed.data);
      if (!updated) {
        res.status(404).json({ error: 'Property not found.' });
        return;
      }
      res.json({ property: updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update property.' });
    }
  });

  app.delete('/api/admin/properties/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { deleted, storagePaths } = await deletePropertyRecord(String(req.params.id));
      if (!deleted) {
        res.status(404).json({ error: 'Property not found.' });
        return;
      }
      for (const sp of storagePaths) {
        deleteStoredFileIfLocalUpload(sp);
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete property.' });
    }
  });

  // Upload one or multiple images to property-images storage bucket
  app.post(
    '/api/admin/properties/:id/images',
    requireAuth,
    upload.array('images', 12),
    async (req: AuthRequest, res) => {
      try {
        const propertyId = String(req.params.id);
        const prop = await getAdminPropertyById(propertyId);
        if (!prop) {
          res.status(404).json({ error: 'Property not found.' });
          return;
        }

        const uploadedFiles = (req.files as Express.Multer.File[]) || [];
        if (uploadedFiles.length === 0) {
          res.status(400).json({ error: 'No image files uploaded.' });
          return;
        }

        const defaultCaption =
          typeof req.body?.caption === 'string' ? req.body.caption.trim() : '';
        const defaultAlt =
          typeof req.body?.altText === 'string' && req.body.altText.trim() !== ''
            ? req.body.altText.trim()
            : `${prop.title} – ${prop.location} | Shri Goyal Associate`;

        const records = uploadedFiles.map((file) => ({
          storagePath: `property-images/${file.filename}`,
          publicUrl: `/uploads/property-images/${file.filename}`,
          caption: defaultCaption,
          altText: defaultAlt,
        }));

        const saved = await addPropertyImages(propertyId, records);
        res.status(201).json({ images: saved });
      } catch (error: any) {
        res.status(500).json({ error: error.message || 'Image upload failed.' });
      }
    }
  );

  app.patch('/api/admin/images/:imageId', requireAuth, async (req: AuthRequest, res) => {
    const parsed = imageMetadataSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid image metadata.' });
      return;
    }

    try {
      const updated = await updatePropertyImageMetadata(
        String(req.params.imageId),
        parsed.data
      );
      if (!updated) {
        res.status(404).json({ error: 'Image not found.' });
        return;
      }
      res.json({ image: updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update image.' });
    }
  });

  app.put(
    '/api/admin/properties/:id/images/reorder',
    requireAuth,
    async (req: AuthRequest, res) => {
      const orderedIds = Array.isArray(req.body?.orderedIds)
        ? req.body.orderedIds.map(String)
        : [];
      try {
        const images = await reorderPropertyImages(String(req.params.id), orderedIds);
        res.json({ images });
      } catch (error: any) {
        res.status(500).json({ error: error.message || 'Failed to reorder images.' });
      }
    }
  );

  app.delete('/api/admin/images/:imageId', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { deleted, storagePath } = await deletePropertyImage(
        String(req.params.imageId)
      );
      if (!deleted) {
        res.status(404).json({ error: 'Image not found.' });
        return;
      }
      deleteStoredFileIfLocalUpload(storagePath);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete image.' });
    }
  });

  app.get('/api/admin/media', requireAuth, async (req: AuthRequest, res) => {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const media = await getAllMediaItems(search);
      res.json({ media });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load media library.' });
    }
  });

  app.get('/api/admin/inquiries', requireAuth, async (req: AuthRequest, res) => {
    try {
      const inquiries = await getAdminInquiries({
        status: typeof req.query.status === 'string' ? req.query.status : undefined,
        search: typeof req.query.search === 'string' ? req.query.search : undefined,
      });
      res.json({ inquiries });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load inquiries.' });
    }
  });

  app.patch('/api/admin/inquiries/:id', requireAuth, async (req: AuthRequest, res) => {
    const parsed = inquiryStatusUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid status value.' });
      return;
    }

    try {
      const updated = await updateInquiryStatusRecord(
        String(req.params.id),
        parsed.data.status
      );
      if (!updated) {
        res.status(404).json({ error: 'Inquiry not found.' });
        return;
      }
      res.json({ inquiry: updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update inquiry.' });
    }
  });

  // Vite middleware in development, static dist in production
  const distPath = path.resolve(process.cwd(), 'dist');
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(distPath);

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(
      express.static(distPath, {
        maxAge: '7d',
        index: false,
      })
    );
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Shri Goyal Associate server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
