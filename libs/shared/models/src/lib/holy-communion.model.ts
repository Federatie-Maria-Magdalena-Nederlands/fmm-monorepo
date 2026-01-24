export interface HolyCommunion {
  // Step 1: Communicant Information
  communicantGender: string;
  communicantSurname: string;
  communicantFirstNames: string;
  communicantDOB: string;
  communicantPlaceOfBirth: string;
  communicantNationality: string;
  communicantBaptized: string;
  communicantBaptismDate?: string;
  communicantBaptismPlace?: string;
  communicantParishName?: string;
  communicantCertificate?: File;

  // Step 2: Mother's Information
  motherSurname: string;
  motherFirstNames: string;
  motherDOB: string;
  motherPlaceOfBirth: string;
  motherBaptized: string;
  motherBaptismDate?: string;
  motherBaptismPlace?: string;
  motherCertificate?: File;
  motherNationality: string;
  motherAddress: string;
  motherPostalCity: string;
  motherPhone: string;
  motherEmail: string;

  // Step 3: Father's Information
  fatherSurname: string;
  fatherFirstNames: string;
  fatherDOB: string;
  fatherPlaceOfBirth: string;
  fatherBaptized: string;
  fatherBaptismDate?: string;
  fatherCertificate?: File;
  fatherNationality: string;
  fatherAddress: string;
  fatherPostalCity: string;
  fatherPhone: string;
  fatherEmail: string;

  // Step 4: Godparents Information
  godparentsFirstName: string;
  godparentsLastName: string;
  godparentsDOB: string;
  godparentsPhone: string;
  godparentsAddress: string;
  godparentsPostalCity: string;
  godparentsCatholic: string;
  godparentsCertificate?: File;

  // Step 5: Privacy and Additional
  privacyAgreement: string;
  additionalField?: string;
}
