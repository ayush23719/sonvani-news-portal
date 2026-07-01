import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { HomePage } from '@/pages/HomePage'
import { ArticleDetailPage } from '@/pages/ArticleDetailPage'
import { CategoryPage } from '@/pages/CategoryPage'
import { DistrictPage } from '@/pages/DistrictPage'
import { StatePage } from '@/pages/StatePage'
import { LoginPage } from '@/pages/LoginPage'
import { AdminUsersPage } from '@/pages/AdminUsersPage'
import { AdminDashboardPage } from '@/pages/AdminDashboardPage'
import { AdminArticlesPage } from '@/pages/AdminArticlesPage'
import { AdminCreateArticlePage } from '@/pages/AdminCreateArticlePage'
import { AdminEditArticlePage } from '@/pages/AdminEditArticlePage'
import { AdminProfilePage } from '@/pages/AdminProfilePage'
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
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'cms',
        element: <LoginPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <RequireAuth allowedRoles={['ADMIN', 'REPORTER']}>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: 'articles',
        element: <AdminArticlesPage />,
      },
      {
        path: 'articles/new',
        element: <AdminCreateArticlePage />,
      },
      {
        path: 'articles/:articleId',
        element: <AdminEditArticlePage />,
      },
      {
        path: 'profile',
        element: <AdminProfilePage />,
      },
      {
        path: 'users',
        element: <AdminUsersPage />,
      },
    ],
  },
])
