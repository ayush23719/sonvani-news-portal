import { ListingPage } from '@/pages/ListingPage'

export function CategoryPage() {
  return (
    <ListingPage
      kind="category"
      heading="श्रेणी की खबरें"
      emptyMessage="इस श्रेणी में अभी कोई खबर नहीं है।"
    />
  )
}
