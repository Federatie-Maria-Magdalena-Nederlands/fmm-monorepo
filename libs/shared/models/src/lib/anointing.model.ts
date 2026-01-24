export interface Anointing {
  // Step 1: Sender Information
  senderName: string;
  senderLastName: string;
  senderPhone: string;
  senderEmail: string;

  // Step 2: Recipient Information
  recipientName: string;
  recipientSurname: string;
  recipientFirstName: string;
  recipientAddress: string;
  recipientPostalCity: string;
  recipientDOB: string;

  // Step 3: Privacy
  privacyAgreement: string;
}
