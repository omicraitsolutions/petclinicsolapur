export type Language = 'English' | 'Marathi' | 'Hindi' | 'Spanish' | 'French';

export interface Translations {
  // Navigation & Brand
  brandName: string;
  tagline: string;
  dashboard: string;
  pets: string;
  addPetNav: string;
  petProfile: string;
  owners: string;
  treatments: string;
  appointments: string;
  billing: string;
  reports: string;
  emailReport: string;
  settings: string;
  logout: string;

  // Header / Navbar
  quickRegister: string;
  notifications: string;
  veterinarian: string;
  switchTheme: string;
  switchLanguage: string;
  searchPlaceholder: string;

  // Common Actions & Badges
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  view: string;
  print: string;
  downloadPdf: string;
  reset: string;
  close: string;
  actions: string;
  status: string;
  date: string;
  time: string;
  loading: string;
  all: string;
  details: string;
  confirmed: string;
  pending: string;
  completed: string;
  cancelled: string;
  paid: string;
  overdue: string;
  healthy: string;
  treatmentStatus: string;
  critical: string;
  recovered: string;

  // Dashboard
  totalPets: string;
  todaysVisits: string;
  treatmentStats: string;
  emailsSent: string;
  recentPatients: string;
  viewAllPets: string;
  todaysAppointments: string;
  manage: string;
  vaccinationDueCount: string;
  newPatientsCount: string;
  pendingReportsCount: string;
  noRecentPatients: string;

  // Pet Management
  petManagementTitle: string;
  petManagementSubtitle: string;
  searchPetOwner: string;
  allBreeds: string;
  petId: string;
  photo: string;
  petName: string;
  owner: string;
  breed: string;
  gender: string;
  age: string;
  male: string;
  female: string;
  noPetsFound: string;
  deletePetTitle: string;
  deletePetMessage: string;

  // Register Pet
  registerPetTitle: string;
  editPetTitle: string;
  petInfoSection: string;
  petType: string;
  weight: string;
  petColor: string;
  uploadPhoto: string;
  ownerDetailsSection: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerAddress: string;
  medicalDetailsSection: string;
  diseaseDiagnosis: string;
  symptoms: string;
  vaccinated: string;
  yes: string;
  no: string;
  medicalHistory: string;
  savePetBtn: string;
  petRegisteredSuccess: string;

  // Pet Profile
  petInfoTitle: string;
  petInfoSubtitle: string;
  selectPet: string;
  addVisitRecord: string;
  sendEmailReportBtn: string;
  printReportBtn: string;
  editProfileBtn: string;
  noPetRecord: string;
  pastTreatmentsTitle: string;

  // Treatments
  treatmentDetailsTitle: string;
  treatmentGiven: string;
  medicines: string;
  nextVisit: string;
  doctorNotes: string;
  saveTreatmentBtn: string;
  previousVisits: string;
  doctor: string;

  // Appointments
  appointmentManagementTitle: string;
  appointmentManagementSubtitle: string;
  newAppointmentBtn: string;
  bookAppointmentBtn: string;
  appointmentDetailsTitle: string;
  updateStatus: string;
  noAppointmentsToday: string;

  // Billing
  billingTitle: string;
  billingSubtitle: string;
  generateInvoiceBtn: string;
  totalBilled: string;
  totalCollected: string;
  pendingPayments: string;
  invoiceId: string;
  totalAmount: string;
  method: string;
  servicesRendered: string;
  consultationFee: string;
  taxGst: string;
  paymentMethod: string;
  paymentStatus: string;
  createInvoiceBtn: string;
  markPaid: string;
  noInvoicesFound: string;

  // Reports
  reportsTitle: string;
  reportsSubtitle: string;
  monthlyReportTitle: string;
  commonDiseasesTitle: string;
  month: string;
  patients: string;
  revenue: string;
  totalCases: string;

  // Email Report
  emailReportTitle: string;
  subject: string;
  emailPreview: string;
  previewBtn: string;
  sendEmailBtn: string;
  emailDispatchPreview: string;
  sendNow: string;

  // Settings
  clinicSettingsTitle: string;
  clinicSettingsSubtitle: string;
  clinicInfoTab: string;
  preferencesTab: string;
  saveChangesBtn: string;
  clinicName: string;
  doctorName: string;
  clinicAddress: string;
  clinicLogo: string;
  emailConfigTitle: string;
  smtpEmail: string;
  smtpPassword: string;
  smtpHost: string;
  smtpPort: string;
  notificationSettingsTitle: string;
  emailNotifications: string;
  smsNotifications: string;
  appointmentReminder: string;
  vaccinationReminder: string;
  backupSettingsTitle: string;
  automaticBackup: string;
  backupStorage: string;
  appearanceTitle: string;
  theme: string;
  themeLight: string;
  themeDark: string;
  language: string;
  saveSettingsBtn: string;
  enabled: string;
  disabled: string;

  // Login
  welcomeBack: string;
  loginSubtitle: string;
  password: string;
  rememberMe: string;
  forgotPassword: string;
  loginBtn: string;
  loggingIn: string;
}

export const translations: Record<Language, Translations> = {
  English: {
    brandName: 'PetCare',
    tagline: 'Manage Pets, Treatments, Appointments and Medical Records.',
    dashboard: 'Dashboard',
    pets: 'Pets',
    addPetNav: '+ Add Pet',
    petProfile: 'Pet Profile',
    owners: 'Owners',
    treatments: 'Treatments',
    appointments: 'Appointments',
    billing: 'Billing',
    reports: 'Reports',
    emailReport: 'Email Report',
    settings: 'Settings',
    logout: 'Logout',

    quickRegister: 'Quick Register',
    notifications: 'Notifications',
    veterinarian: 'Veterinarian',
    switchTheme: 'Switch Theme',
    switchLanguage: 'Language',
    searchPlaceholder: 'Search...',

    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    print: 'Print',
    downloadPdf: 'Download PDF',
    reset: 'Reset',
    close: 'Close',
    actions: 'Action',
    status: 'Status',
    date: 'Date',
    time: 'Time',
    loading: 'Loading data...',
    all: 'All',
    details: 'Details',
    confirmed: 'Confirmed',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    paid: 'Paid',
    overdue: 'Overdue',
    healthy: 'Healthy',
    treatmentStatus: 'Treatment',
    critical: 'Critical',
    recovered: 'Recovered',

    totalPets: 'Total Pets',
    todaysVisits: "Today's Visits",
    treatmentStats: 'Treatments',
    emailsSent: 'Emails Sent',
    recentPatients: 'Recent Patients',
    viewAllPets: 'View All Pets →',
    todaysAppointments: "Today's Appointments",
    manage: 'Manage',
    vaccinationDueCount: '12 Vaccination Due',
    newPatientsCount: '5 New Patients',
    pendingReportsCount: '3 Pending Treatment Reports',
    noRecentPatients: 'No recent patient records found',

    petManagementTitle: 'Pet Management',
    petManagementSubtitle: 'registered pets in the clinic registry',
    searchPetOwner: 'Search by Pet / Owner',
    allBreeds: 'All Breeds',
    petId: 'Pet ID',
    photo: 'Photo',
    petName: 'Pet Name',
    owner: 'Owner',
    breed: 'Breed',
    gender: 'Gender',
    age: 'Age',
    male: 'Male',
    female: 'Female',
    noPetsFound: 'No pets found matching criteria.',
    deletePetTitle: 'Delete Pet Record',
    deletePetMessage: 'Are you sure you want to remove this pet from the clinic registry? This action cannot be undone.',

    registerPetTitle: 'Register New Pet',
    editPetTitle: 'Edit Pet Profile',
    petInfoSection: 'Pet Information',
    petType: 'Pet Type',
    weight: 'Weight (kg)',
    petColor: 'Pet Color',
    uploadPhoto: 'Upload Photo',
    ownerDetailsSection: 'Owner Details',
    ownerName: 'Owner Name',
    ownerEmail: 'Email',
    ownerPhone: 'Mobile',
    ownerAddress: 'Address',
    medicalDetailsSection: 'Medical Details',
    diseaseDiagnosis: 'Disease / Diagnosis',
    symptoms: 'Symptoms',
    vaccinated: 'Vaccinated',
    yes: 'Yes',
    no: 'No',
    medicalHistory: 'Medical History',
    savePetBtn: 'Save Pet',
    petRegisteredSuccess: 'Pet Registered Successfully!',

    petInfoTitle: 'Pet Information',
    petInfoSubtitle: 'Complete veterinary profile and historical medical records',
    selectPet: 'Select Pet:',
    addVisitRecord: '+ Add Visit Record',
    sendEmailReportBtn: 'Send Email Report',
    printReportBtn: 'Print Report',
    editProfileBtn: 'Edit Profile',
    noPetRecord: 'No pet record available.',
    pastTreatmentsTitle: 'Medical History',

    treatmentDetailsTitle: 'Treatment Details',
    treatmentGiven: 'Treatment Given',
    medicines: 'Medicines',
    nextVisit: 'Next Visit',
    doctorNotes: 'Doctor Notes',
    saveTreatmentBtn: 'Save Treatment',
    previousVisits: 'Previous Visits',
    doctor: 'Doctor',

    appointmentManagementTitle: 'Appointment Management',
    appointmentManagementSubtitle: 'Schedule visits, consultations, routine checkups, and vaccinations',
    newAppointmentBtn: '+ New Appointment',
    bookAppointmentBtn: 'Book Appointment',
    appointmentDetailsTitle: 'Appointment Details',
    updateStatus: 'Update Status:',
    noAppointmentsToday: 'No appointments scheduled for today.',

    billingTitle: 'Billing & Invoices',
    billingSubtitle: 'Manage treatment billing, consultation fees, receipts, and payment records',
    generateInvoiceBtn: '+ Generate Invoice',
    totalBilled: 'Total Billed',
    totalCollected: 'Total Collected',
    pendingPayments: 'Pending Payments',
    invoiceId: 'Invoice ID',
    totalAmount: 'Total Amount',
    method: 'Method',
    servicesRendered: 'Services Rendered',
    consultationFee: 'Consult Fee (₹)',
    taxGst: 'Tax GST (₹)',
    paymentMethod: 'Payment Method',
    paymentStatus: 'Payment Status',
    createInvoiceBtn: 'Create Invoice',
    markPaid: 'Mark Paid',
    noInvoicesFound: 'No billing records found.',

    reportsTitle: 'Reports & Analytics',
    reportsSubtitle: 'Operational summaries, disease frequencies, and financial metrics',
    monthlyReportTitle: 'Monthly Report',
    commonDiseasesTitle: 'Most Common Diseases',
    month: 'Month',
    patients: 'Patients',
    revenue: 'Revenue',
    totalCases: 'Total Cases',

    emailReportTitle: 'Email Treatment Report',
    subject: 'Subject',
    emailPreview: 'Email Preview',
    previewBtn: 'Preview',
    sendEmailBtn: 'Send Email',
    emailDispatchPreview: 'Email Dispatch Preview',
    sendNow: 'Send Now',

    clinicSettingsTitle: 'Clinic Settings',
    clinicSettingsSubtitle: 'Manage your veterinary clinic information and preferences.',
    clinicInfoTab: 'Clinic Info',
    preferencesTab: 'Preferences',
    saveChangesBtn: 'Save Changes',
    clinicName: 'Clinic Name',
    doctorName: 'Doctor Name',
    clinicAddress: 'Clinic Address',
    clinicLogo: 'Clinic Logo',
    emailConfigTitle: 'Email Configuration',
    smtpEmail: 'SMTP Email',
    smtpPassword: 'SMTP Password',
    smtpHost: 'SMTP Host',
    smtpPort: 'SMTP Port',
    notificationSettingsTitle: 'Notification Settings',
    emailNotifications: 'Email Notifications',
    smsNotifications: 'SMS Notifications',
    appointmentReminder: 'Appointment Reminder',
    vaccinationReminder: 'Vaccination Reminder',
    backupSettingsTitle: 'Backup Settings',
    automaticBackup: 'Automatic Backup',
    backupStorage: 'Backup Storage',
    appearanceTitle: 'Appearance',
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    language: 'Language',
    saveSettingsBtn: 'Save Settings',
    enabled: 'Enabled',
    disabled: 'Disabled',

    welcomeBack: 'Welcome Back',
    loginSubtitle: 'Please login to continue',
    password: 'Password',
    rememberMe: 'Remember Me',
    forgotPassword: 'Forgot Password?',
    loginBtn: 'Login',
    loggingIn: 'Logging in...'
  },

  Marathi: {
    brandName: 'पेटकेअर (PetCare)',
    tagline: 'पाळीव प्राणी, उपचार, अपॉइंटमेंट्स आणि वैद्यकीय नोंदींचे व्यवस्थापन.',
    dashboard: 'डॅशबोर्ड',
    pets: 'पाळीव प्राणी',
    addPetNav: '+ प्राणी जोडा',
    petProfile: 'प्राणी प्रोफाइल',
    owners: 'मालक',
    treatments: 'उपचार तपशील',
    appointments: 'अपॉइंटमेंट्स',
    billing: 'बिलिंग आणि इनव्हॉइस',
    reports: 'अहवाल आणि विश्लेषण',
    emailReport: 'ईमेल अहवाल',
    settings: 'क्लिनिक सेटिंग्ज',
    logout: 'लॉग आउट',

    quickRegister: 'द्रुत नोंदणी',
    notifications: 'सूचना',
    veterinarian: 'पशुवैद्यकीय डॉक्टर',
    switchTheme: 'थीम बदला',
    switchLanguage: 'भाषा निवडा',
    searchPlaceholder: 'शोधा...',

    save: 'जतन करा',
    cancel: 'रद्द करा',
    edit: 'संपादित करा',
    delete: 'हटवा',
    view: 'पहा',
    print: 'प्रिंट करा',
    downloadPdf: 'पीडीएफ डाउनलोड करा',
    reset: 'रीसेट करा',
    close: 'बंद करा',
    actions: 'कृती',
    status: 'स्थिती',
    date: 'तारीख',
    time: 'वेळ',
    loading: 'माहिती लोड होत आहे...',
    all: 'सर्व',
    details: 'तपशील',
    confirmed: 'पुष्टी झाली',
    pending: 'प्रलंबित',
    completed: 'पूर्ण झाले',
    cancelled: 'रद्द केले',
    paid: 'भरणा झाला',
    overdue: 'थकबाकी',
    healthy: 'निरोगी (Healthy)',
    treatmentStatus: 'उपचार सुरू',
    critical: 'गंभीर',
    recovered: 'बरे झाले',

    totalPets: 'एकूण पाळीव प्राणी',
    todaysVisits: 'आजच्या भेटी',
    treatmentStats: 'उपचार',
    emailsSent: 'पाठवलेले ईमेल',
    recentPatients: 'अलीकडील रुग्ण',
    viewAllPets: 'सर्व पाळीव प्राणी पहा →',
    todaysAppointments: 'आजच्या अपॉइंटमेंट्स',
    manage: 'व्यवस्थापित करा',
    vaccinationDueCount: '१२ लसीकरण बाकी',
    newPatientsCount: '५ नवीन रुग्ण',
    pendingReportsCount: '३ प्रलंबित उपचार अहवाल',
    noRecentPatients: 'कोणतेही अलीकडील रुग्ण सापडले नाहीत',

    petManagementTitle: 'पाळीव प्राणी व्यवस्थापन',
    petManagementSubtitle: 'क्लिनिक नोंदवहीत नोंदणीकृत पाळीव प्राणी',
    searchPetOwner: 'पाळीव प्राणी / मालकाच्या नावाने शोधा',
    allBreeds: 'सर्व जाती (All Breeds)',
    petId: 'प्राणी आयडी',
    photo: 'फोटो',
    petName: 'प्राण्याचे नाव',
    owner: 'मालक',
    breed: 'जात / ब्रीड',
    gender: 'लिंग',
    age: 'वय',
    male: 'नर (Male)',
    female: 'मादी (Female)',
    noPetsFound: 'शोध निकषांनुसार कोणतेही पाळीव प्राणी सापडले नाहीत.',
    deletePetTitle: 'नोंद हटवा',
    deletePetMessage: 'तुम्हाला नक्की या पाळीव प्राण्याची नोंद क्लिनिकमधून हटवायची आहे का? ही क्रिया पूर्ववत करता येणार नाही.',

    registerPetTitle: 'नवीन पाळीव प्राण्याची नोंदणी करा',
    editPetTitle: 'पाळीव प्राणी प्रोफाइल संपादित करा',
    petInfoSection: 'प्राण्याची माहिती',
    petType: 'प्राण्याचा प्रकार',
    weight: 'वजन (कि.ग्रॅ.)',
    petColor: 'प्राण्याचा रंग',
    uploadPhoto: 'फोटो अपलोड करा',
    ownerDetailsSection: 'मालकाचा तपशील',
    ownerName: 'मालकाचे नाव',
    ownerEmail: 'ईमेल',
    ownerPhone: 'मोबाईल नंबर',
    ownerAddress: 'पत्ता',
    medicalDetailsSection: 'वैद्यकीय तपशील',
    diseaseDiagnosis: 'आजार / निदान',
    symptoms: 'लक्षणे',
    vaccinated: 'लसीकरण झाले आहे का?',
    yes: 'होय (Yes)',
    no: 'नाही (No)',
    medicalHistory: 'वैद्यकीय इतिहास',
    savePetBtn: 'पाळीव प्राणी जतन करा',
    petRegisteredSuccess: 'पाळीव प्राण्याची नोंदणी यशस्वीरित्या झाली!',

    petInfoTitle: 'पाळीव प्राण्याची माहिती',
    petInfoSubtitle: 'संपूर्ण पशुवैद्यकीय प्रोफाइल आणि वैद्यकीय इतिहास नोंदी',
    selectPet: 'प्राणी निवडा:',
    addVisitRecord: '+ भेट नोंद जोडा',
    sendEmailReportBtn: 'ईमेल अहवाल पाठवा',
    printReportBtn: 'अहवाल प्रिंट करा',
    editProfileBtn: 'प्रोफाइल संपादित करा',
    noPetRecord: 'कोणतीही पाळीव प्राण्याची नोंद उपलब्ध नाही.',
    pastTreatmentsTitle: 'वैद्यकीय इतिहास आणि मागील भेटी',

    treatmentDetailsTitle: 'उपचार तपशील',
    treatmentGiven: 'दिलेले उपचार',
    medicines: 'औषधे',
    nextVisit: 'पुढची भेट',
    doctorNotes: 'डॉक्टरांच्या नोंदी',
    saveTreatmentBtn: 'उपचार जतन करा',
    previousVisits: 'मागील भेटी',
    doctor: 'डॉक्टर',

    appointmentManagementTitle: 'अपॉइंटमेंट व्यवस्थापन',
    appointmentManagementSubtitle: 'भेटी, सल्लामसलत, नियमित तपासणी आणि लसीकरण शेड्यूल करा',
    newAppointmentBtn: '+ नवीन अपॉइंटमेंट',
    bookAppointmentBtn: 'अपॉइंटमेंट बुक करा',
    appointmentDetailsTitle: 'अपॉइंटमेंट तपशील',
    updateStatus: 'स्थिती बदला:',
    noAppointmentsToday: 'आज कोणतीही अपॉइंटमेंट नियोजित नाही.',

    billingTitle: 'बिलिंग आणि इनव्हॉइस',
    billingSubtitle: 'उपचार बिलिंग, फी, पावत्या आणि पेमेंट नोंदी व्यवस्थापित करा',
    generateInvoiceBtn: '+ इनव्हॉइस तयार करा',
    totalBilled: 'एकूण बिल रक्कम',
    totalCollected: 'एकूण जमा रक्कम',
    pendingPayments: 'प्रलंबित देयके',
    invoiceId: 'इनव्हॉइस आयडी',
    totalAmount: 'एकूण रक्कम',
    method: 'पेमेंट पद्धत',
    servicesRendered: 'दिलेल्या सेवा',
    consultationFee: 'सल्लामसलत फी (₹)',
    taxGst: 'कर जीएसटी (₹)',
    paymentMethod: 'पेमेंट पद्धत',
    paymentStatus: 'पेमेंट स्थिती',
    createInvoiceBtn: 'इनव्हॉइस तयार करा',
    markPaid: 'भरणा झाला म्हणून नोंदवा',
    noInvoicesFound: 'कोणतीही बिलिंग नोंद सापडली नाही.',

    reportsTitle: 'अहवाल आणि विश्लेषण',
    reportsSubtitle: 'क्लिनिक सारांश, रोगांची वारंवारता आणि वित्तीय मेट्रिक्स',
    monthlyReportTitle: 'मासिक अहवाल',
    commonDiseasesTitle: 'सर्वात सामान्य आजार',
    month: 'महिना',
    patients: 'रुग्ण संख्या',
    revenue: 'उत्पन्न (महसूल)',
    totalCases: 'एकूण प्रकरणे',

    emailReportTitle: 'ईमेल उपचार अहवाल',
    subject: 'विषय',
    emailPreview: 'ईमेल पूर्वावलोकन',
    previewBtn: 'पूर्वावलोकन',
    sendEmailBtn: 'ईमेल पाठवा',
    emailDispatchPreview: 'ईमेल प्रेषण पूर्वावलोकन',
    sendNow: 'आता पाठवा',

    clinicSettingsTitle: 'क्लिनिक सेटिंग्ज',
    clinicSettingsSubtitle: 'आपल्या पशुवैद्यकीय क्लिनिकची माहिती आणि प्राधान्ये व्यवस्थापित करा.',
    clinicInfoTab: 'क्लिनिक माहिती',
    preferencesTab: 'प्राधान्ये (Preferences)',
    saveChangesBtn: 'बदल जतन करा',
    clinicName: 'क्लिनिकचे नाव',
    doctorName: 'डॉक्टरांचे नाव',
    clinicAddress: 'क्लिनिकचा पत्ता',
    clinicLogo: 'क्लिनिक लोगो',
    emailConfigTitle: 'ईमेल कॉन्फिगरेशन (SMTP)',
    smtpEmail: 'SMTP ईमेल',
    smtpPassword: 'SMTP पासवर्ड',
    smtpHost: 'SMTP होस्ट',
    smtpPort: 'SMTP पोर्ट',
    notificationSettingsTitle: 'सूचना सेटिंग्ज',
    emailNotifications: 'ईमेल सूचना',
    smsNotifications: 'एसएमएस सूचना',
    appointmentReminder: 'अपॉइंटमेंट स्मरणपत्र',
    vaccinationReminder: 'लसीकरण स्मरणपत्र',
    backupSettingsTitle: 'बॅकअप सेटिंग्ज',
    automaticBackup: 'स्वयंचलित बॅकअप',
    backupStorage: 'बॅकअप स्टोरेज',
    appearanceTitle: 'देखावा आणि थीम (Appearance)',
    theme: 'थीम (रंग)',
    themeLight: 'लाईट (Light)',
    themeDark: 'डार्क (Dark)',
    language: 'भाषा (Language)',
    saveSettingsBtn: 'सेटिंग्ज जतन करा',
    enabled: 'सक्षम (Enabled)',
    disabled: 'अक्षम (Disabled)',

    welcomeBack: 'पुन्हा स्वागत आहे!',
    loginSubtitle: 'कृपया पुढे जाण्यासाठी लॉगिन करा',
    password: 'पासवर्ड',
    rememberMe: 'माझी आठवण ठेवा',
    forgotPassword: 'पासवर्ड विसरलात?',
    loginBtn: 'लॉगिन करा',
    loggingIn: 'लॉगिन होत आहे...'
  },

  Hindi: {
    brandName: 'पेटकेयर (PetCare)',
    tagline: 'पालतू जानवर, उपचार, अपॉइंटमेंट्स और मेडिकल रिकॉर्ड्स का प्रबंधन।',
    dashboard: 'डैशबोर्ड',
    pets: 'पालतू जानवर',
    addPetNav: '+ नया पालतू जोड़ें',
    petProfile: 'पालतू प्रोफाइल',
    owners: 'मालिक',
    treatments: 'उपचार विवरण',
    appointments: 'अपॉइंटमेंट्स',
    billing: 'बिलिंग और इनवॉइस',
    reports: 'रिपोर्ट्स और एनालिटिक्स',
    emailReport: 'ईमेल रिपोर्ट',
    settings: 'क्लिनिक सेटिंग्स',
    logout: 'लॉग आउट',

    quickRegister: 'त्वरित पंजीकरण',
    notifications: 'सूचनाएं',
    veterinarian: 'पशु चिकित्सक',
    switchTheme: 'थीम बदलें',
    switchLanguage: 'भाषा',
    searchPlaceholder: 'खोजें...',

    save: 'सहेजें',
    cancel: 'रद्द करें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    view: 'देखें',
    print: 'प्रिंट करें',
    downloadPdf: 'पीडीएफ डाउनलोड करें',
    reset: 'रीसेट करें',
    close: 'बंद करें',
    actions: 'कार्रवाई',
    status: 'स्थिति',
    date: 'तारीख',
    time: 'समय',
    loading: 'डेटा लोड हो रहा है...',
    all: 'सभी',
    details: 'विवरण',
    confirmed: 'पुष्ट',
    pending: 'लंबित',
    completed: 'पूर्ण',
    cancelled: 'रद्द',
    paid: 'भुगतान हो गया',
    overdue: 'अतिदेय',
    healthy: 'स्वस्थ',
    treatmentStatus: 'उपचारधीन',
    critical: 'गंभीर',
    recovered: 'स्वस्थ हुआ',

    totalPets: 'कुल पालतू जानवर',
    todaysVisits: 'आज की मुलाकातें',
    treatmentStats: 'उपचार',
    emailsSent: 'भेजे गए ईमेल',
    recentPatients: 'हाल के मरीज',
    viewAllPets: 'सभी पालतू देखें →',
    todaysAppointments: 'आज की अपॉइंटमेंट्स',
    manage: 'प्रबंधित करें',
    vaccinationDueCount: '12 टीकाकरण देय',
    newPatientsCount: '5 नए मरीज',
    pendingReportsCount: '3 लंबित उपचार रिपोर्ट',
    noRecentPatients: 'कोई हालिया मरीज रिकॉर्ड नहीं मिला',

    petManagementTitle: 'पालतू प्रबंधन',
    petManagementSubtitle: 'क्लिनिक रजिस्ट्री में पंजीकृत कुल पालतू जानवर',
    searchPetOwner: 'पालतू या मालिक के नाम से खोजें',
    allBreeds: 'सभी नस्लें (All Breeds)',
    petId: 'पालतू आईडी',
    photo: 'फोटो',
    petName: 'पालतू का नाम',
    owner: 'मालिक',
    breed: 'नस्ल',
    gender: 'लिंग',
    age: 'आयु',
    male: 'नर (Male)',
    female: 'मादा (Female)',
    noPetsFound: 'खोज मानदंडों से मेल खाने वाले कोई पालतू नहीं मिले।',
    deletePetTitle: 'रिकॉर्ड हटाएं',
    deletePetMessage: 'क्या आप वाकई इस पालतू जानवर को रजिस्ट्री से हटाना चाहते हैं?',

    registerPetTitle: 'नया पालतू पंजीकृत करें',
    editPetTitle: 'पालतू प्रोफाइल संपादित करें',
    petInfoSection: 'पालतू जानकारी',
    petType: 'पालतू का प्रकार',
    weight: 'वजन (किग्रा)',
    petColor: 'रंग',
    uploadPhoto: 'फोटो अपलोड करें',
    ownerDetailsSection: 'मालिक का विवरण',
    ownerName: 'मालिक का नाम',
    ownerEmail: 'ईमेल',
    ownerPhone: 'मोबाइल नंबर',
    ownerAddress: 'पता',
    medicalDetailsSection: 'चिकित्सा विवरण',
    diseaseDiagnosis: 'रोग / निदान',
    symptoms: 'लक्षण',
    vaccinated: 'टीकाकरण किया गया?',
    yes: 'हाँ',
    no: 'नहीं',
    medicalHistory: 'चिकित्सा इतिहास',
    savePetBtn: 'पालतू सहेजें',
    petRegisteredSuccess: 'पालतू सफलतापूर्वक पंजीकृत हुआ!',

    petInfoTitle: 'पालतू जानकारी',
    petInfoSubtitle: 'पूर्ण पशु चिकित्सा प्रोफाइल और ऐतिहासिक रिकॉर्ड',
    selectPet: 'पालतू चुनें:',
    addVisitRecord: '+ मुलाकात रिकॉर्ड जोड़ें',
    sendEmailReportBtn: 'ईमेल रिपोर्ट भेजें',
    printReportBtn: 'रिपोर्ट प्रिंट करें',
    editProfileBtn: 'प्रोफाइल संपादित करें',
    noPetRecord: 'कोई पालतू रिकॉर्ड उपलब्ध नहीं है।',
    pastTreatmentsTitle: 'चिकित्सा इतिहास',

    treatmentDetailsTitle: 'उपचार विवरण',
    treatmentGiven: 'दिया गया उपचार',
    medicines: 'दवाएं',
    nextVisit: 'अगली मुलाकात',
    doctorNotes: 'डॉक्टर के नोट्स',
    saveTreatmentBtn: 'उपचार सहेजें',
    previousVisits: 'पिछली मुलाकातें',
    doctor: 'डॉक्टर',

    appointmentManagementTitle: 'अपॉइंटमेंट प्रबंधन',
    appointmentManagementSubtitle: 'परामर्श, जांच और टीकाकरण शेड्यूल करें',
    newAppointmentBtn: '+ नई अपॉइंटमेंट',
    bookAppointmentBtn: 'अपॉइंटमेंट बुक करें',
    appointmentDetailsTitle: 'अपॉइंटमेंट विवरण',
    updateStatus: 'स्थिति अपडेट करें:',
    noAppointmentsToday: 'आज के लिए कोई अपॉइंटमेंट निर्धारित नहीं है।',

    billingTitle: 'बिलिंग और इनवॉइस',
    billingSubtitle: 'उपचार बिलिंग, फीस और रसीदें प्रबंधित करें',
    generateInvoiceBtn: '+ इनवॉइस बनाएं',
    totalBilled: 'कुल बिल',
    totalCollected: 'कुल जमा',
    pendingPayments: 'लंबित भुगतान',
    invoiceId: 'इनवॉइस आईडी',
    totalAmount: 'कुल राशि',
    method: 'भुगतान विधि',
    servicesRendered: 'दी गई सेवाएं',
    consultationFee: 'परामर्श शुल्क (₹)',
    taxGst: 'टैक्स जीएसटी (₹)',
    paymentMethod: 'भुगतान का प्रकार',
    paymentStatus: 'भुगतान स्थिति',
    createInvoiceBtn: 'इनवॉइस बनाएं',
    markPaid: 'भुगतान पूरा चिन्हित करें',
    noInvoicesFound: 'कोई बिलिंग रिकॉर्ड नहीं मिला।',

    reportsTitle: 'रिपोर्ट्स और एनालिटिक्स',
    reportsSubtitle: 'क्लिनिक प्रदर्शन, रोग आवृत्तियां और वित्तीय मेट्रिक्स',
    monthlyReportTitle: 'मासिक रिपोर्ट',
    commonDiseasesTitle: 'प्रमुख बीमारियां',
    month: 'महीना',
    patients: 'मरीज',
    revenue: 'राजस्व',
    totalCases: 'कुल मामले',

    emailReportTitle: 'ईमेल उपचार रिपोर्ट',
    subject: 'विषय',
    emailPreview: 'ईमेल पूर्वावलोकन',
    previewBtn: 'पूर्वावलोकन',
    sendEmailBtn: 'ईमेल भेजें',
    emailDispatchPreview: 'ईमेल डिस्पैच पूर्वावलोकन',
    sendNow: 'अभी भेजें',

    clinicSettingsTitle: 'क्लिनिक सेटिंग्स',
    clinicSettingsSubtitle: 'अपनी पशु क्लिनिक जानकारी और प्राथमिकताओं का प्रबंधन करें।',
    clinicInfoTab: 'क्लिनिक जानकारी',
    preferencesTab: 'प्राथमिकताएं',
    saveChangesBtn: 'परिवर्तन सहेजें',
    clinicName: 'क्लिनिक का नाम',
    doctorName: 'डॉक्टर का नाम',
    clinicAddress: 'क्लिनिक का पता',
    clinicLogo: 'क्लिनिक लोगो',
    emailConfigTitle: 'ईमेल विन्यास (SMTP)',
    smtpEmail: 'SMTP ईमेल',
    smtpPassword: 'SMTP पासवर्ड',
    smtpHost: 'SMTP होस्ट',
    smtpPort: 'SMTP पोर्ट',
    notificationSettingsTitle: 'अधिसूचना सेटिंग्स',
    emailNotifications: 'ईमेल सूचनाएं',
    smsNotifications: 'एसएमएस सूचनाएं',
    appointmentReminder: 'अपॉइंटमेंट रिमाइंडर',
    vaccinationReminder: 'टीकाकरण रिमाइंडर',
    backupSettingsTitle: 'बैकअप सेटिंग्स',
    automaticBackup: 'स्वचालित बैकअप',
    backupStorage: 'बैकअप स्टोरेज',
    appearanceTitle: 'दिखावट (Appearance)',
    theme: 'थीम',
    themeLight: 'लाइट (Light)',
    themeDark: 'डार्क (Dark)',
    language: 'भाषा (Language)',
    saveSettingsBtn: 'सेटिंग्स सहेजें',
    enabled: 'सक्षम',
    disabled: 'अक्षम',

    welcomeBack: 'वापसी पर स्वागत है!',
    loginSubtitle: 'कृपया जारी रखने के लिए लॉगिन करें',
    password: 'पासवर्ड',
    rememberMe: 'मुझे याद रखें',
    forgotPassword: 'पासवर्ड भूल गए?',
    loginBtn: 'लॉगिन',
    loggingIn: 'लॉगिन हो रहा है...'
  },

  Spanish: {
    brandName: 'PetCare',
    tagline: 'Gestión de Mascotas, Tratamientos, Citas y Registros Médicos.',
    dashboard: 'Panel de Control',
    pets: 'Mascotas',
    addPetNav: '+ Añadir Mascota',
    petProfile: 'Perfil de Mascota',
    owners: 'Propietarios',
    treatments: 'Tratamientos',
    appointments: 'Citas',
    billing: 'Facturación',
    reports: 'Informes',
    emailReport: 'Informe por Correo',
    settings: 'Configuración',
    logout: 'Cerrar Sesión',

    quickRegister: 'Registro Rápido',
    notifications: 'Notificaciones',
    veterinarian: 'Veterinario',
    switchTheme: 'Cambiar Tema',
    switchLanguage: 'Idioma',
    searchPlaceholder: 'Buscar...',

    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    view: 'Ver',
    print: 'Imprimir',
    downloadPdf: 'Descargar PDF',
    reset: 'Restablecer',
    close: 'Cerrar',
    actions: 'Acción',
    status: 'Estado',
    date: 'Fecha',
    time: 'Hora',
    loading: 'Cargando datos...',
    all: 'Todo',
    details: 'Detalles',
    confirmed: 'Confirmado',
    pending: 'Pendiente',
    completed: 'Completado',
    cancelled: 'Cancelado',
    paid: 'Pagado',
    overdue: 'Vencido',
    healthy: 'Saludable',
    treatmentStatus: 'Tratamiento',
    critical: 'Crítico',
    recovered: 'Recuperado',

    totalPets: 'Total Mascotas',
    todaysVisits: 'Visitas de Hoy',
    treatmentStats: 'Tratamientos',
    emailsSent: 'Correos Enviados',
    recentPatients: 'Pacientes Recientes',
    viewAllPets: 'Ver Todas las Mascotas →',
    todaysAppointments: 'Citas de Hoy',
    manage: 'Gestionar',
    vaccinationDueCount: '12 Vacunas Pendientes',
    newPatientsCount: '5 Nuevos Pacientes',
    pendingReportsCount: '3 Informes Pendientes',
    noRecentPatients: 'No se encontraron pacientes recientes',

    petManagementTitle: 'Gestión de Mascotas',
    petManagementSubtitle: 'mascotas registradas en la clínica',
    searchPetOwner: 'Buscar por Mascota / Propietario',
    allBreeds: 'Todas las Razas',
    petId: 'ID Mascota',
    photo: 'Foto',
    petName: 'Nombre de Mascota',
    owner: 'Propietario',
    breed: 'Raza',
    gender: 'Género',
    age: 'Edad',
    male: 'Macho',
    female: 'Hembra',
    noPetsFound: 'No se encontraron mascotas.',
    deletePetTitle: 'Eliminar Registro',
    deletePetMessage: '¿Está seguro de eliminar este registro?',

    registerPetTitle: 'Registrar Nueva Mascota',
    editPetTitle: 'Editar Perfil de Mascota',
    petInfoSection: 'Información de la Mascota',
    petType: 'Tipo de Mascota',
    weight: 'Peso (kg)',
    petColor: 'Color',
    uploadPhoto: 'Subir Foto',
    ownerDetailsSection: 'Datos del Propietario',
    ownerName: 'Nombre del Propietario',
    ownerEmail: 'Correo Electrónico',
    ownerPhone: 'Teléfono',
    ownerAddress: 'Dirección',
    medicalDetailsSection: 'Detalles Médicos',
    diseaseDiagnosis: 'Diagnóstico / Enfermedad',
    symptoms: 'Síntomas',
    vaccinated: '¿Vacunado?',
    yes: 'Sí',
    no: 'No',
    medicalHistory: 'Historial Médico',
    savePetBtn: 'Guardar Mascota',
    petRegisteredSuccess: '¡Mascota registrada con éxito!',

    petInfoTitle: 'Información de Mascota',
    petInfoSubtitle: 'Perfil veterinario completo e historial',
    selectPet: 'Seleccionar Mascota:',
    addVisitRecord: '+ Añadir Visita',
    sendEmailReportBtn: 'Enviar Informe por Correo',
    printReportBtn: 'Imprimir Informe',
    editProfileBtn: 'Editar Perfil',
    noPetRecord: 'No hay registro de mascota disponible.',
    pastTreatmentsTitle: 'Historial Médico',

    treatmentDetailsTitle: 'Detalles del Tratamiento',
    treatmentGiven: 'Tratamiento Aplicado',
    medicines: 'Medicamentos',
    nextVisit: 'Próxima Visita',
    doctorNotes: 'Notas del Doctor',
    saveTreatmentBtn: 'Guardar Tratamiento',
    previousVisits: 'Visitas Anteriores',
    doctor: 'Doctor',

    appointmentManagementTitle: 'Gestión de Citas',
    appointmentManagementSubtitle: 'Programar visitas, consultas y vacunas',
    newAppointmentBtn: '+ Nueva Cita',
    bookAppointmentBtn: 'Reservar Cita',
    appointmentDetailsTitle: 'Detalles de la Cita',
    updateStatus: 'Actualizar Estado:',
    noAppointmentsToday: 'No hay citas programadas para hoy.',

    billingTitle: 'Facturación y Recibos',
    billingSubtitle: 'Gestionar cobros, tarifas y pagos',
    generateInvoiceBtn: '+ Generar Factura',
    totalBilled: 'Total Facturado',
    totalCollected: 'Total Recaudado',
    pendingPayments: 'Pagos Pendientes',
    invoiceId: 'ID Factura',
    totalAmount: 'Monto Total',
    method: 'Método',
    servicesRendered: 'Servicios Prestados',
    consultationFee: 'Consulta (₹)',
    taxGst: 'Impuestos (₹)',
    paymentMethod: 'Método de Pago',
    paymentStatus: 'Estado de Pago',
    createInvoiceBtn: 'Crear Factura',
    markPaid: 'Marcar Pagado',
    noInvoicesFound: 'No se encontraron facturas.',

    reportsTitle: 'Informes y Análisis',
    reportsSubtitle: 'Resúmenes clínicos y métricas financieras',
    monthlyReportTitle: 'Informe Mensual',
    commonDiseasesTitle: 'Enfermedades Más Comunes',
    month: 'Mes',
    patients: 'Pacientes',
    revenue: 'Ingresos',
    totalCases: 'Total Casos',

    emailReportTitle: 'Enviar Informe Médico',
    subject: 'Asunto',
    emailPreview: 'Vista Previa del Correo',
    previewBtn: 'Vista Previa',
    sendEmailBtn: 'Enviar Correo',
    emailDispatchPreview: 'Vista Previa de Envío',
    sendNow: 'Enviar Ahora',

    clinicSettingsTitle: 'Configuración de Clínica',
    clinicSettingsSubtitle: 'Administre la información y preferencias de su clínica.',
    clinicInfoTab: 'Info Clínica',
    preferencesTab: 'Preferencias',
    saveChangesBtn: 'Guardar Cambios',
    clinicName: 'Nombre de la Clínica',
    doctorName: 'Nombre del Doctor',
    clinicAddress: 'Dirección',
    clinicLogo: 'Logo',
    emailConfigTitle: 'Configuración de Correo (SMTP)',
    smtpEmail: 'Correo SMTP',
    smtpPassword: 'Clave SMTP',
    smtpHost: 'Servidor SMTP',
    smtpPort: 'Puerto SMTP',
    notificationSettingsTitle: 'Notificaciones',
    emailNotifications: 'Notificaciones por Correo',
    smsNotifications: 'Notificaciones SMS',
    appointmentReminder: 'Recordatorio de Citas',
    vaccinationReminder: 'Recordatorio de Vacunas',
    backupSettingsTitle: 'Copias de Seguridad',
    automaticBackup: 'Copia Automática',
    backupStorage: 'Almacenamiento',
    appearanceTitle: 'Apariencia',
    theme: 'Tema',
    themeLight: 'Claro (Light)',
    themeDark: 'Oscuro (Dark)',
    language: 'Idioma',
    saveSettingsBtn: 'Guardar Configuración',
    enabled: 'Habilitado',
    disabled: 'Deshabilitado',

    welcomeBack: 'Bienvenido de nuevo',
    loginSubtitle: 'Inicie sesión para continuar',
    password: 'Contraseña',
    rememberMe: 'Recordarme',
    forgotPassword: '¿Olvidó su contraseña?',
    loginBtn: 'Iniciar Sesión',
    loggingIn: 'Iniciando sesión...'
  },

  French: {
    brandName: 'PetCare',
    tagline: 'Gestion des Animaux, Traitements, Rendez-vous et Dossiers Médicaux.',
    dashboard: 'Tableau de Bord',
    pets: 'Animaux',
    addPetNav: '+ Ajouter Animal',
    petProfile: 'Profil Animal',
    owners: 'Propriétaires',
    treatments: 'Traitements',
    appointments: 'Rendez-vous',
    billing: 'Facturation',
    reports: 'Rapports',
    emailReport: 'Rapport par E-mail',
    settings: 'Paramètres',
    logout: 'Déconnexion',

    quickRegister: 'Enregistrement Rapide',
    notifications: 'Notifications',
    veterinarian: 'Vétérinaire',
    switchTheme: 'Changer de Thème',
    switchLanguage: 'Langue',
    searchPlaceholder: 'Rechercher...',

    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    delete: 'Supprimer',
    view: 'Voir',
    print: 'Imprimer',
    downloadPdf: 'Télécharger PDF',
    reset: 'Réinitialiser',
    close: 'Fermer',
    actions: 'Action',
    status: 'Statut',
    date: 'Date',
    time: 'Heure',
    loading: 'Chargement des données...',
    all: 'Tous',
    details: 'Détails',
    confirmed: 'Confirmé',
    pending: 'En attente',
    completed: 'Terminé',
    cancelled: 'Annulé',
    paid: 'Payé',
    overdue: 'En retard',
    healthy: 'En bonne santé',
    treatmentStatus: 'En traitement',
    critical: 'Critique',
    recovered: 'Rétabli',

    totalPets: 'Total Animaux',
    todaysVisits: "Visites d'Aujourd'hui",
    treatmentStats: 'Traitements',
    emailsSent: 'E-mails Envoyés',
    recentPatients: 'Patients Récents',
    viewAllPets: 'Voir Tous les Animaux →',
    todaysAppointments: "Rendez-vous d'Aujourd'hui",
    manage: 'Gérer',
    vaccinationDueCount: '12 Vaccins Dus',
    newPatientsCount: '5 Nouveaux Patients',
    pendingReportsCount: '3 Rapports en Attente',
    noRecentPatients: 'Aucun patient récent trouvé',

    petManagementTitle: 'Gestion des Animaux',
    petManagementSubtitle: 'animaux enregistrés dans la clinique',
    searchPetOwner: 'Rechercher par Animal / Propriétaire',
    allBreeds: 'Toutes les Races',
    petId: 'ID Animal',
    photo: 'Photo',
    petName: "Nom de l'Animal",
    owner: 'Propriétaire',
    breed: 'Race',
    gender: 'Genre',
    age: 'Âge',
    male: 'Mâle',
    female: 'Femelle',
    noPetsFound: 'Aucun animal trouvé.',
    deletePetTitle: 'Supprimer le Dossier',
    deletePetMessage: 'Voulez-vous vraiment supprimer cet animal ?',

    registerPetTitle: 'Nouvel Animal',
    editPetTitle: "Modifier le Profil de l'Animal",
    petInfoSection: "Informations sur l'Animal",
    petType: "Type d'Animal",
    weight: 'Poids (kg)',
    petColor: 'Couleur',
    uploadPhoto: 'Téléverser Photo',
    ownerDetailsSection: 'Détails du Propriétaire',
    ownerName: 'Nom du Propriétaire',
    ownerEmail: 'E-mail',
    ownerPhone: 'Téléphone',
    ownerAddress: 'Adresse',
    medicalDetailsSection: 'Détails Médicaux',
    diseaseDiagnosis: 'Maladie / Diagnostic',
    symptoms: 'Symptômes',
    vaccinated: 'Vacciné ?',
    yes: 'Oui',
    no: 'Non',
    medicalHistory: 'Historique Médical',
    savePetBtn: "Enregistrer l'Animal",
    petRegisteredSuccess: 'Animal enregistré avec succès !',

    petInfoTitle: "Informations sur l'Animal",
    petInfoSubtitle: 'Dossier vétérinaire complet et historique',
    selectPet: 'Sélectionner un Animal :',
    addVisitRecord: '+ Ajouter Visite',
    sendEmailReportBtn: 'Envoyer Rapport par E-mail',
    printReportBtn: 'Imprimer le Rapport',
    editProfileBtn: 'Modifier le Profil',
    noPetRecord: 'Aucun dossier disponible.',
    pastTreatmentsTitle: 'Historique Médical',

    treatmentDetailsTitle: 'Détails du Traitement',
    treatmentGiven: 'Traitement Donné',
    medicines: 'Médicaments',
    nextVisit: 'Prochaine Visite',
    doctorNotes: 'Notes du Docteur',
    saveTreatmentBtn: 'Enregistrer le Traitement',
    previousVisits: 'Visites Précédentes',
    doctor: 'Docteur',

    appointmentManagementTitle: 'Gestion des Rendez-vous',
    appointmentManagementSubtitle: 'Planifier consultations, visites et vaccins',
    newAppointmentBtn: '+ Nouveau Rendez-vous',
    bookAppointmentBtn: 'Prendre Rendez-vous',
    appointmentDetailsTitle: 'Détails du Rendez-vous',
    updateStatus: 'Modifier le Statut :',
    noAppointmentsToday: "Aucun rendez-vous prévu aujourd'hui.",

    billingTitle: 'Facturation et Règlements',
    billingSubtitle: 'Gestion des honoraires et encaissements',
    generateInvoiceBtn: '+ Créer Facture',
    totalBilled: 'Total Facturé',
    totalCollected: 'Total Encaissé',
    pendingPayments: 'En Attente',
    invoiceId: 'N° Facture',
    totalAmount: 'Montant Total',
    method: 'Méthode',
    servicesRendered: 'Prestations Fournies',
    consultationFee: 'Consultation (₹)',
    taxGst: 'Taxes (₹)',
    paymentMethod: 'Mode de Paiement',
    paymentStatus: 'Statut du Paiement',
    createInvoiceBtn: 'Générer la Facture',
    markPaid: 'Marquer comme Payé',
    noInvoicesFound: 'Aucune facture trouvée.',

    reportsTitle: 'Rapports et Statistiques',
    reportsSubtitle: 'Synthèses cliniques et indicateurs financiers',
    monthlyReportTitle: 'Rapport Mensuel',
    commonDiseasesTitle: 'Pathologies Fréquentes',
    month: 'Mois',
    patients: 'Patients',
    revenue: 'Revenus',
    totalCases: 'Total Cas',

    emailReportTitle: 'Envoi du Rapport par E-mail',
    subject: 'Objet',
    emailPreview: "Aperçu de l'E-mail",
    previewBtn: 'Aperçu',
    sendEmailBtn: 'Envoyer E-mail',
    emailDispatchPreview: "Aperçu d'Envoi",
    sendNow: 'Envoyer Maintenant',

    clinicSettingsTitle: 'Paramètres de la Clinique',
    clinicSettingsSubtitle: 'Gérer les informations et préférences de la clinique.',
    clinicInfoTab: 'Infos Clinique',
    preferencesTab: 'Préférences',
    saveChangesBtn: 'Enregistrer les Modifications',
    clinicName: 'Nom de la Clinique',
    doctorName: 'Nom du Vétérinaire',
    clinicAddress: 'Adresse',
    clinicLogo: 'Logo',
    emailConfigTitle: 'Configuration E-mail (SMTP)',
    smtpEmail: 'E-mail SMTP',
    smtpPassword: 'Mot de passe SMTP',
    smtpHost: 'Serveur SMTP',
    smtpPort: 'Port SMTP',
    notificationSettingsTitle: 'Notifications',
    emailNotifications: 'Notifications E-mail',
    smsNotifications: 'Notifications SMS',
    appointmentReminder: 'Rappel de Rendez-vous',
    vaccinationReminder: 'Rappel de Vaccination',
    backupSettingsTitle: 'Sauvegarde',
    automaticBackup: 'Sauvegarde Automatique',
    backupStorage: 'Stockage',
    appearanceTitle: 'Apparence',
    theme: 'Thème',
    themeLight: 'Clair (Light)',
    themeDark: 'Sombre (Dark)',
    language: 'Langue',
    saveSettingsBtn: 'Enregistrer les Paramètres',
    enabled: 'Activé',
    disabled: 'Désactivé',

    welcomeBack: 'Bon retour !',
    loginSubtitle: 'Veuillez vous connecter pour continuer',
    password: 'Mot de passe',
    rememberMe: 'Se souvenir de moi',
    forgotPassword: 'Mot de passe oublié ?',
    loginBtn: 'Connexion',
    loggingIn: 'Connexion en cours...'
  }
};

export const getTranslation = (lang: Language = 'English'): Translations => {
  return translations[lang] || translations.English;
};
