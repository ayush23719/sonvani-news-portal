import { ListingPage } from '@/pages/ListingPage'

export function StatePage() {
  return (
    <ListingPage
      kind="state"
      heading="राज्य की खबरें"
      emptyMessage="इस राज्य में अभी कोई खबर नहीं है।"
    />
  )
}
