import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { inquiryFormSchema, type InquiryFormValues } from '../lib/validations';
import { fetchPublicProperties, submitPublicInquiry } from '../lib/api';
import type { PropertyRecord } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface InquiryFormProps {
  preselectedPropertyId?: string;
  preselectedPropertyTitle?: string;
  compact?: boolean;
}

export function InquiryForm({
  preselectedPropertyId,
  preselectedPropertyTitle,
  compact = false,
}: InquiryFormProps) {
  const [propertiesList, setPropertiesList] = useState<PropertyRecord[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultMsg = preselectedPropertyTitle
    ? `Hello Shri Goyal Associate, I would like complete details and a site visit for "${preselectedPropertyTitle}".`
    : '';

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      message: defaultMsg,
      propertyId: preselectedPropertyId || '',
    },
  });

  useEffect(() => {
    if (preselectedPropertyId) {
      setValue('propertyId', preselectedPropertyId);
    }
    if (preselectedPropertyTitle) {
      setValue(
        'message',
        `Hello Shri Goyal Associate, I would like complete details and a site visit for "${preselectedPropertyTitle}".`
      );
    }
  }, [preselectedPropertyId, preselectedPropertyTitle, setValue]);

  useEffect(() => {
    if (!preselectedPropertyId) {
      fetchPublicProperties()
        .then((items) => setPropertiesList(items))
        .catch(() => setPropertiesList([]));
    }
  }, [preselectedPropertyId]);

  const onSubmit = async (values: InquiryFormValues) => {
    setServerError(null);
    setSubmitSuccess(false);
    try {
      await submitPublicInquiry({
        ...values,
        propertyId: values.propertyId ? values.propertyId : null,
      });
      setSubmitSuccess(true);
      reset({
        name: '',
        phone: '',
        email: '',
        message: defaultMsg,
        propertyId: preselectedPropertyId || '',
      });
    } catch (err: any) {
      setServerError(
        err?.message || 'Unable to submit your inquiry right now. Please call 9720241212.'
      );
    }
  };

  if (submitSuccess) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-6 text-left space-y-3">
        <div className="flex items-center gap-2.5 text-emerald-900 font-medium">
          <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" aria-hidden="true" />
          <span>Inquiry Received Successfully</span>
        </div>
        <p className="text-sm text-emerald-800 leading-relaxed">
          Thank you for contacting <strong>Shri Goyal Associate</strong>. Jitendra Goyal or Hemant Goyal will reach out to you shortly.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setSubmitSuccess(false)}
        >
          Send Another Inquiry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-800"
        >
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{serverError}</span>
        </div>
      )}

      <div className={compact ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
        <div className="space-y-1.5">
          <Label htmlFor="inq-name">Full Name *</Label>
          <Input
            id="inq-name"
            placeholder="Your full name"
            autoComplete="name"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="inq-phone">Phone Number *</Label>
          <Input
            id="inq-phone"
            type="tel"
            placeholder="98XXXXXXXX"
            autoComplete="tel"
            {...register('phone')}
          />
          {errors.phone && (
            <p className="text-xs text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className={compact ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
        <div className="space-y-1.5">
          <Label htmlFor="inq-email">Email Address *</Label>
          <Input
            id="inq-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        {preselectedPropertyId ? (
          <div className="space-y-1.5">
            <Label htmlFor="inq-prop-readonly">Selected Property</Label>
            <Input
              id="inq-prop-readonly"
              value={preselectedPropertyTitle || 'Selected Property'}
              readOnly
              className="bg-stone-50 text-stone-600"
            />
            <input type="hidden" {...register('propertyId')} />
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="inq-property">Interested Property (Optional)</Label>
            <select
              id="inq-property"
              {...register('propertyId')}
              className="flex min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-[#18181b] focus-visible:outline-none focus-visible:border-[#9a7b3e] focus-visible:ring-2 focus-visible:ring-[#9a7b3e]/20"
            >
              <option value="">General Property Consultation</option>
              {propertiesList.map((prop) => (
                <option key={prop.id} value={prop.id}>
                  {prop.title} ({prop.location})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="inq-message">Your Requirement / Message *</Label>
        <Textarea
          id="inq-message"
          rows={compact ? 3 : 4}
          placeholder="Tell us about your preferred location, budget, plot size, or site visit schedule..."
          {...register('message')}
        />
        {errors.message && (
          <p className="text-xs text-red-600">{errors.message.message}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="gold"
        size="lg"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Submitting Inquiry...
          </>
        ) : (
          'Request Property Consultation'
        )}
      </Button>
    </form>
  );
}
