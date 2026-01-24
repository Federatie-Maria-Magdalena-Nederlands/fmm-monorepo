export interface Volunteer {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  message: string;
  volunteerFor: string[]; // Array of selected volunteer roles
}
