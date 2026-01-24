export interface Donations {
  // Step 1: Personal Information
  name: string;
  lastName: string;

  // Step 2: Contact Information
  address1: string;
  address2: string;
  email: string;
  phoneNumber: string;

  // Step 3: Donation Information
  donationAmount: string;
  customAmount?: number;
  message?: string;

  // Step 4: Payment Information
  bankAccount: string;
  agreement: boolean;
}
