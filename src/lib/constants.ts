// Central constants — pricing and other config
// Do NOT hardcode prices throughout the app; always use these or fetch from DB

export const DEFAULT_BW_PRICE = 3.00;
export const DEFAULT_COLOUR_PRICE = 5.00;

export const PRICING = {
  bw: DEFAULT_BW_PRICE,
  colour: DEFAULT_COLOUR_PRICE,
};

export const ADMIN_EMAIL = 'div.pandey.html@gmail.com';

export const APP_NAME = 'Kairo';
export const APP_TAGLINE = 'Print what you need. Pay only for what you print.';
export const COLLEGE_NAME = 'KCC Institute of Technology and Management';

export const MAX_COPIES = 50;
export const MAX_FILES_PER_ORDER = 20;
export const MAX_FILE_SIZE_MB = 100;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ORDER_STATUSES = ['pending', 'accepted', 'printing', 'ready', 'completed', 'cancelled'] as const;

export const COLLEGE_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
export const COLLEGE_SECTIONS = ['A', 'B', 'C', 'D', 'E'];

export const KCC_PROGRAMMES = [
  // B.Tech — KCC ITM (AKTU)
  'B.Tech Computer Science & Engineering (CSE)',
  'B.Tech CSE (AI & Machine Learning)',
  'B.Tech CSE (Data Science)',
  'B.Tech CSE (Internet of Things)',
  'B.Tech Information Technology (IT)',
  'B.Tech Electronics & Communication (ECE)',
  'B.Tech Mechanical Engineering',
  'B.Tech Civil Engineering',
  'B.Tech Electrical Engineering',
  'B.Tech Lateral Entry (2nd Year)',

  // Postgraduate — KCC ITM (AKTU)
  'MBA (Master of Business Administration)',
  'M.Tech Computer Science & Engineering',
  'M.Tech Electronics & Communication',
  'M.Tech Mechanical Engineering',

  // Undergraduate & Law — KCC ILHE (IPU / GGSIPU)
  'BCA — Bachelor of Computer Applications (IPU)',
  'BBA — Bachelor of Business Administration (IPU)',
  'B.Com (Hons.) (IPU)',
  'BA (Journalism & Mass Communication) (IPU)',
  'BA LL.B. (Hons.) — 5 Year Integrated (IPU)',
  'BBA LL.B. (Hons.) — 5 Year Integrated (IPU)',
];
