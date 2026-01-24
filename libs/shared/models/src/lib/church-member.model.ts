export interface ChurchMember {
  // Personal Information
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  phoneNumber: string;

  // Address Information
  address: string;
  postalCodeCity: string;
  mainResident: string;

  // Religious Information
  baptizedCatholic: string;

  // Marital Information
  maritalStatus: string;
  weddingDate?: string;
  dissolutionDate?: string;
  widowedSince?: string;

  // Spouse Information
  spouseSurname?: string;
  spouseFirstNames?: string;
  spouseBirthDate?: string;
  spouseBirthPlace?: string;

  // Additional Information
  familyMembers?: string;
  questions?: string;
}
