export const BUSINESS_INFO = {
  companyName: 'Shri Goyal Associate',
  owners: [
    {
      name: 'Jitendra Goyal',
      role: 'Founder & Principal Consultant',
      image: '/assets/aistudio/852110917_4313507005576552_5488164325380499531_n_3663ff77.jpg',
      alt: 'Jitendra Goyal – Founder and Owner of Shri Goyal Associate, Real Estate Consultant in Mathura',
      bio: 'Leads high-value residential, commercial, and land acquisitions across Mathura and Vrindavan with transparent title verification and deep local market intelligence.',
    },
    {
      name: 'Hemant Goyal',
      role: 'Co-Owner & Senior Property Advisor',
      image: '/assets/aistudio/852243082_2083592802283499_2179126346531225521_n_00c05961.jpg',
      alt: 'Hemant Goyal – Co-Owner and Property Consultant at Shri Goyal Associate in Mathura',
      bio: 'Specializes in MVDA-approved residential townships, retail showrooms, and end-to-end buyer and investor advisory from site inspection through final registration.',
    },
  ],
  officeImage: '/assets/aistudio/Gemini_Generated_Image_73l3fj73l3fj73l3_39b99eec.png',
  officeImageAlt:
    'Shri Goyal Associate Office at Mandi Choraha, Near Shree Ram Sonk Road, Mathura, Uttar Pradesh',
  heroImage: '/images/properties/hero-luxury-estate.jpg',
  ogImage: 'https://www.shrigoyalassociate.in/og-image.jpg',
  domain: 'https://www.shrigoyalassociate.in',
  addressLines: [
    'Mandi Choraha,',
    'Near Shree Ram Sonk Road,',
    'Mathura, Uttar Pradesh – 281004',
  ],
  fullAddress: 'Mandi Choraha, Near Shree Ram Sonk Road, Mathura, Uttar Pradesh – 281004',
  phones: ['9720241212', '9012792020'],
  primaryPhone: '9720241212',
  secondaryPhone: '9012792020',
  whatsappNumber: '919720241212',
  email: 'jgoyal156@gmail.com',
  category: 'Real Estate / Property Dealer / Property Consultant',
} as const;

export function buildWhatsAppUrl(propertyTitle?: string): string {
  const message = propertyTitle
    ? `Hello Shri Goyal Associate, I am interested in "${propertyTitle}". Please share complete details and site visit availability.`
    : 'Hello Shri Goyal Associate, I am interested in a property.';
  return `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
