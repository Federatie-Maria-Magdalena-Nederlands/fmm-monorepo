export interface Confirmation {
  // Step 1: Confirmand Information
  confirmandName: string;
  confirmandSurname: string;
  confirmandFirstName: string;
  confirmandDOB: string;
  confirmandGender: string;
  confirmandNationality: string;
  confirmandBaptized: string;
  confirmandBaptismDate?: string;
  confirmandBaptismPlace?: string;
  confirmandParishName?: string;
  confirmandCertificate?: File;

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
  fatherNationality: string;
  fatherAddress: string;
  fatherPostalCity: string;
  fatherPhone: string;
  fatherEmail: string;

  // Step 4: Sponsor Information
  sponsorName: string;
  sponsorSurname: string;
  sponsorDOB: string;
  sponsorPhone: string;
  sponsorAddress: string;
  sponsorPostalCity: string;
  sponsorCatholic: string;
  sponsorCertificate?: File;

  // Step 5: Privacy and Additional
  privacyAgreement: string;
  additionalField?: string;
}
