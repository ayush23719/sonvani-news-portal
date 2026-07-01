import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/HomePage'
import { ArticleDetailPage } from '@/pages/ArticleDetailPage'
import { CategoryPage } from '@/pages/CategoryPage'
import { DistrictPage } from '@/pages/DistrictPage'
import { StatePage } from '@/pages/StatePage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'articles/:slug',
        element: <ArticleDetailPage />,
      },
      {
        path: 'categories/:categorySlug/articles',
        element: <CategoryPage />,
      },
      {
        path: 'districts/:districtSlug/articles',
        element: <DistrictPage />,
      },
      {
        path: 'states/:stateSlug/articles',
        element: <StatePage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
