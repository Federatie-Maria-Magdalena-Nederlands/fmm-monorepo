export interface Wedding {
  // Step 1: Bride Information
  brideName: string;
  brideLastName: string;
  brideDOB: string;
  bridePhone: string;
  brideEmail: string;
  brideAddress: string;
  bridePostalCity: string;

  // Step 2: Groom Information
  groomName: string;
  groomSurname: string;
  groomDOB: string;
  groomPhone: string;
  groomAddress: string;
  groomPostalCity: string;
  groomEmail: string;

  // Godparents Information
  godparentsName: string;
  godparentsSurname: string;
  godparentsDOB: string;
  godparentsPhone: string;
  godparentsAddress: string;
  godparentsPostalCity: string;
  godparentsCatholic: string;

  // Step 3: Privacy
  privacyAgreement: string;
}
