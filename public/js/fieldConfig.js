const REGISTRATION_SECTIONS = [
  {
    title: 'Registration',
    icon: 'calendar',
    fields: [
      { key: 'registration_date', label: 'Registration Date' },
      { key: 'course_selected', label: 'Course Selected' },
    ],
  },
  {
    title: 'Personal Information',
    icon: 'user',
    fields: [
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'middle_name', label: 'Middle Name' },
      { key: 'dob', label: 'Date of Birth' },
      { key: 'us_citizen', label: 'Are You a US Citizen?' },
    ],
  },
  {
    title: 'Contact Details',
    icon: 'phone',
    fields: [
      { key: 'email', label: 'Email Address' },
      { key: 'current_phone', label: 'Current Phone Number' },
      { key: 'current_address', label: 'Current Address' },
      { key: 'city', label: 'City' },
      { key: 'state', label: 'State' },
      { key: 'zip', label: 'Zip Code' },
    ],
  },
  {
    title: 'Course Interest',
    icon: 'graduation-cap',
    fields: [
      {
        key: 'certified_nursing_assistant',
        label: 'Being a certified nursing assistant is beneficial or have completed a BNATP Course',
      },
      { key: 'phlebotomy_technician', label: 'Phlebotomy Technician' },
      { key: 'recertification_of_skills', label: 'Recertification of Skills' },
      { key: 'bnatp', label: 'BNATP Program' },
      { key: 'phlebotomy', label: 'Phlebotomy Program' },
      { key: 'recert', label: 'Recertification Program' },
    ],
  },
  {
    title: 'Health & Background',
    icon: 'heart-pulse',
    fields: [
      { key: 'communicable_diseases', label: 'Do you have any communicable diseases?' },
      { key: 'criminal_background_check', label: 'Criminal background check?' },
      { key: 'commit_complete_course', label: 'Are you able to commit the time to complete course?' },
      { key: 'rate_yourself', label: 'Rate yourself' },
      { key: 'cooperation_other', label: 'Cooperation with others' },
      { key: 'afraid_of_blood_other', label: 'Are you afraid of blood, needles, diseases?' },
      { key: 'lift_50_70_lbs', label: 'Are you able to lift 50–70 lbs?' },
      { key: 'injuries', label: 'Have you had any injuries? If yes, describe:' },
    ],
  },
  {
    title: 'Employment & Commitment',
    icon: 'briefcase',
    fields: [
      { key: 'currently_working', label: 'Are you currently working?' },
      { key: 'employment_affect_class_schedule', label: 'Will employment affect your class schedule?' },
      {
        key: 'personal_support_completion_course_responsibity',
        label: 'Do you have personal support for completion of course responsibility?',
      },
      { key: 'learning_difficulty', label: 'Do you have any difficulty learning? Explain:' },
      {
        key: 'financial_obligations',
        label:
          'Are you willing and able to make a serious commitment to finishing your training and financial obligations?',
      },
    ],
  },
  {
    title: 'How You Found Us',
    icon: 'megaphone',
    fields: [
      { key: 'about_hugs_inc_courses', label: 'How did you hear about our courses?' },
      { key: 'referred_by', label: 'Referred by' },
      { key: 'sponso', label: 'Sponsor' },
      { key: 'walk_in', label: 'Walk in' },
    ],
  },
  {
    title: 'Submission Record',
    icon: 'clock',
    fields: [
      { key: 'createdAt', label: 'Submitted At' },
      { key: 'updatedAt', label: 'Last Updated' },
    ],
  },
];

const AGREEMENT_SECTIONS = [
  {
    title: 'Student Information',
    icon: 'user',
    fields: [
      { key: 'name', label: 'Full Name' },
      { key: 'add', label: 'Address' },
      { key: 'city', label: 'City' },
      { key: 'social', label: 'Social Security Number' },
      { key: 'email', label: 'Email Address' },
    ],
  },
  {
    title: 'Phone Numbers',
    icon: 'phone',
    fields: [
      { key: 'phoneH', label: 'Home Phone' },
      { key: 'phoneC', label: 'Cell Phone' },
      { key: 'phoneW', label: 'Work Phone' },
      { key: 'tele', label: 'Telephone' },
    ],
  },
  {
    title: 'Emergency Contact',
    icon: 'siren',
    fields: [
      { key: 'emergency', label: 'Emergency Contact Name' },
      { key: 'relation', label: 'Relationship' },
    ],
  },
  {
    title: 'Agreement & Signatures',
    icon: 'file-signature',
    fields: [
      { key: 'date', label: 'Agreement Date' },
      { key: 'sign', label: 'E-Signature of Student' },
    ],
  },
  {
    title: 'Student Initials (Agreement Acknowledgments)',
    icon: 'pen-line',
    fields: [
      { key: 'student1', label: 'Student Initials — Section 1' },
      { key: 'student2', label: 'Student Initials — Section 2' },
      { key: 'student3', label: 'Student Initials — Section 3' },
      { key: 'student4', label: 'Student Initials — Section 4' },
      { key: 'student5', label: 'Student Initials — Section 5' },
      { key: 'student6', label: 'Student Initials — Section 6' },
      { key: 'student7', label: 'Student Initials — Section 7' },
    ],
  },
  {
    title: 'Submission Record',
    icon: 'clock',
    fields: [
      { key: 'createdAt', label: 'Submitted At' },
      { key: 'updatedAt', label: 'Last Updated' },
    ],
  },
];
