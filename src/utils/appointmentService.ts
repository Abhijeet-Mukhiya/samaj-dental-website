export interface AppointmentRequest {
  fullName: string;
  phone: string;
  email?: string;
  preferredDate: string;
  preferredTime: string;
  serviceName: string;
  doctorName?: string;
  message?: string;
}

const clean = (value: string) => value.trim();

export function buildAppointmentEmail(request: AppointmentRequest, clinicEmail: string, clinicName: string) {
  const subject = encodeURIComponent(`Appointment request - ${request.fullName}`);
  const body = [
    `Hello ${clinicName},`,
    '',
    'I would like to request a dental appointment.',
    '',
    `Name: ${clean(request.fullName)}`,
    `Phone: ${clean(request.phone)}`,
    request.email ? `Email: ${clean(request.email)}` : 'Email: Not provided',
    `Preferred date: ${clean(request.preferredDate)}`,
    `Preferred time: ${clean(request.preferredTime)}`,
    `Service: ${clean(request.serviceName)}`,
    request.doctorName ? `Preferred dentist: ${clean(request.doctorName)}` : 'Preferred dentist: Any available dentist',
    request.message ? `Additional message: ${clean(request.message)}` : '',
    '',
    'Please contact me to confirm availability.',
  ].filter(Boolean).join('\n');

  return `mailto:${clinicEmail}?subject=${subject}&body=${encodeURIComponent(body)}`;
}

export function buildAppointmentWhatsApp(request: AppointmentRequest, whatsapp: string, clinicName: string) {
  const message = [
    `Hello ${clinicName},`,
    '',
    'I would like to request a dental appointment.',
    `Name: ${clean(request.fullName)}`,
    `Phone: ${clean(request.phone)}`,
    request.email ? `Email: ${clean(request.email)}` : '',
    `Preferred date: ${clean(request.preferredDate)}`,
    `Preferred time: ${clean(request.preferredTime)}`,
    `Service: ${clean(request.serviceName)}`,
    request.doctorName ? `Preferred dentist: ${clean(request.doctorName)}` : '',
    request.message ? `Message: ${clean(request.message)}` : '',
  ].filter(Boolean).join('\n');

  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
}
