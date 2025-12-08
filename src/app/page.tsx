import { redirect } from 'next/navigation';

const Page = () => {
  // This function throws an error internally to trigger the redirect
  // No return statement or JSX is needed below it.
  redirect('/location-registration');
};

export default Page;