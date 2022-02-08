const colors = require('tailwindcss/colors');

module.exports = {
  // first theme default
  '.theme-light': {
    // primary: colors.blue[400],
    // daisy light
    primary: '#570df8',
    'primary-focus': '#4506cb',
    'primary-content': '#ffffff',
    secondary: '#f000b8',
    'secondary-focus': '#bd0091',
    'secondary-content': '#ffffff',
    accent: '#37cdbe',
    'accent-focus': '#2aa79b',
    'accent-content': '#ffffff',
    neutral: '#3d4451',
    'neutral-focus': '#2a2e37',
    'neutral-content': '#ffffff',
    'base-100': colors.white,
    'base-200': colors.gray[200],
    'base-300': colors.gray[300],
    'base-content': '#1f2937',
    info: '#2094f3',
    success: '#009485',
    warning: '#ff9900',
    error: '#ff5724',
  },
  '.theme-dark': {
    // daisy dark
    primary: '#793ef9',
    'primary-focus': '#570df8',
    'primary-content': '#ffffff',
    secondary: '#f000b8',
    'secondary-focus': '#bd0091',
    'secondary-content': '#ffffff',
    accent: '#37cdbe',
    'accent-focus': '#2aa79b',
    'accent-content': '#ffffff',
    neutral: '#2a2e37',
    'neutral-focus': '#16181d',
    'neutral-content': '#ffffff',
    'base-100': '#3d4451',
    'base-200': '#2a2e37',
    'base-300': '#16181d',
    'base-content': '#ebecf0',
    info: '#66c6ff',
    success: '#87d039',
    warning: '#e2d562',
    error: '#ff6f6f',
  },
};
