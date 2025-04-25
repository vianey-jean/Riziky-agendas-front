
import { Appointment } from './AppointmentService';

export function useNotificationService(appointments: Appointment[]) {
  const resetNotifications = () => {};

  return {
    resetNotifications,
  };
}
