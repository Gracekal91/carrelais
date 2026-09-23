import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['fr', 'en'],
 
  // Used when no locale matches
  defaultLocale: 'fr',
  
  // Don't show /fr/ in the URL for the default language
  localePrefix: 'as-needed',
  
  // Disable automatic locale detection based on user's browser settings
  // so that it ALWAYS defaults to French for new visitors
  localeDetection: false,

  // Disable next-intl automatic HTTP Link header generation
  // (Prevents middleware from emitting localhost alternate link headers; HTML head provides absolute HTTPS tags)
  alternateLinks: false,
});
 
// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);
