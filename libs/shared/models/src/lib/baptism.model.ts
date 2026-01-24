export interface Baptism {
  // Step 1: Sender Information
  senderFirstName: string;
  senderLastName: string;
  senderPhone: string;
  senderEmail: string;

  // Step 2: Recipient Information
  sacramentType: string;
  recipientFirstName: string;
  recipientLastName: string;
  recipientDOB: string;
  recipientPlaceOfBirth: string;
  recipientNationality: string;
  recipientAddress: string;
  recipientPostalCity: string;
  recipientPhone: string;

  // Step 3: Parents Information
  motherName: string;
  fatherName: string;

  // Step 4: Godparents Information
  godparentFirstName: string;
  godparentLastName: string;
  godparentDOB: string;
  godparentAddress: string;
  godparentPostalCity: string;
  godparentPhone: string;
  godparentCatholic: string;

  // Step 5: Privacy and Date
  privacyAgreement: string;
  baptismDate: string;
}
