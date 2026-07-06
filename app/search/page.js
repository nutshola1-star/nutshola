// app/search/page.js
import SearchResultsClient from './SearchResultsClient';

export const metadata = {
  title: 'Search Results - Nutshola',
  description: 'Search for premium quality nuts, seeds, and spices at Nutshola.',
};

export default function SearchPage({ searchParams }) {
  return <SearchResultsClient searchParams={searchParams} />;
}