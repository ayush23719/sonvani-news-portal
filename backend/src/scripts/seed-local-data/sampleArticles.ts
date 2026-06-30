import { BatchWriteCommand } from '@aws-sdk/lib-dynamodb'
import { dynamoDbDocumentClient } from '../../shared/clients/dynamodb.js'
import { getRequiredEnv } from '../../shared/env/environment.js'
import type { Article } from '../../shared/types/news.js'

type ArticleRecord = Article & {
  pk: 'ARTICLE'
  sk: string
  createdAt: string
  createdBy: string
  updatedBy: string
  breakingPartition?: 'BREAKING'
  featuredPartition?: 'FEATURED'
}

const dryRun = process.argv.includes('--dry-run')
const mediaBaseUrl = process.env.MEDIA_BASE_URL ?? 'https://media.example.com'

const sampleArticles: ArticleRecord[] = [
  createArticleRecord({
    articleId: 'sample-article-001',
    slug: 'sonbhadra-vikas-karyon-ki-samiksha',
    title: 'सोनभद्र में विकास कार्यों की समीक्षा, समय पर काम पूरा करने के निर्देश',
    summary: 'जिलाधिकारी ने सड़क, स्वास्थ्य और पेयजल योजनाओं की प्रगति की समीक्षा की।',
    body:
      'सोनभद्र में विकास कार्यों की समीक्षा बैठक आयोजित की गई। अधिकारियों को निर्देश दिया गया कि जनता से जुड़े कार्यों को समयबद्ध और गुणवत्ता के साथ पूरा किया जाए।',
    reporterName: 'सोनवाणी संवाददाता',
    category: 'राज्य',
    categorySlug: 'rajya',
    district: 'सोनभद्र',
    districtSlug: 'sonbhadra',
    state: 'उत्तर प्रदेश',
    stateSlug: 'uttar-pradesh',
    publishDate: '2026-07-01T05:30:00.000Z',
    isBreaking: true,
    isFeatured: true,
    imageSlug: 'sonbhadra-vikas-karyon-ki-samiksha',
    seo: {
      title: 'सोनभद्र विकास कार्य समीक्षा | सोनवाणी',
      description: 'सोनभद्र में विकास कार्यों की समीक्षा और प्रशासनिक निर्देशों की पूरी खबर।',
      keywords: ['सोनभद्र', 'विकास कार्य', 'उत्तर प्रदेश', 'हिंदी समाचार'],
    },
  }),
  createArticleRecord({
    articleId: 'sample-article-002',
    slug: 'varanasi-ghaton-par-swachhta-abhiyan',
    title: 'वाराणसी के घाटों पर स्वच्छता अभियान, स्थानीय लोगों ने किया सहयोग',
    summary: 'नगर निगम की टीम ने सुबह से घाटों पर सफाई अभियान चलाया।',
    body:
      'वाराणसी में गंगा घाटों पर विशेष स्वच्छता अभियान चलाया गया। स्थानीय लोगों और स्वयंसेवकों ने भी इस अभियान में हिस्सा लिया।',
    reporterName: 'वाराणसी ब्यूरो',
    category: 'स्थानीय',
    categorySlug: 'local',
    district: 'वाराणसी',
    districtSlug: 'varanasi',
    state: 'उत्तर प्रदेश',
    stateSlug: 'uttar-pradesh',
    publishDate: '2026-07-01T04:45:00.000Z',
    isBreaking: false,
    isFeatured: true,
    imageSlug: 'varanasi-ghaton-par-swachhta-abhiyan',
    seo: {
      title: 'वाराणसी घाट स्वच्छता अभियान | सोनवाणी',
      description: 'वाराणसी के घाटों पर चलाए गए स्वच्छता अभियान की ताजा जानकारी।',
      keywords: ['वाराणसी', 'गंगा घाट', 'स्वच्छता अभियान', 'स्थानीय खबर'],
    },
  }),
  createArticleRecord({
    articleId: 'sample-article-003',
    slug: 'lucknow-suraksha-vyavastha-samiksha',
    title: 'लखनऊ में सुरक्षा व्यवस्था की समीक्षा, प्रमुख बाजारों में गश्त बढ़ी',
    summary: 'त्योहारी भीड़ को देखते हुए पुलिस ने अतिरिक्त टीमों की तैनाती की।',
    body:
      'लखनऊ में सुरक्षा व्यवस्था को लेकर अधिकारियों ने समीक्षा बैठक की। प्रमुख बाजारों और भीड़भाड़ वाले इलाकों में गश्त बढ़ाने के निर्देश दिए गए हैं।',
    reporterName: 'लखनऊ डेस्क',
    category: 'क्राइम',
    categorySlug: 'crime',
    district: 'लखनऊ',
    districtSlug: 'lucknow',
    state: 'उत्तर प्रदेश',
    stateSlug: 'uttar-pradesh',
    publishDate: '2026-07-01T04:10:00.000Z',
    isBreaking: true,
    isFeatured: false,
    imageSlug: 'lucknow-suraksha-vyavastha-samiksha',
    seo: {
      title: 'लखनऊ सुरक्षा व्यवस्था समीक्षा | सोनवाणी',
      description: 'लखनऊ में सुरक्षा व्यवस्था और पुलिस गश्त से जुड़ी ताजा खबर।',
      keywords: ['लखनऊ', 'सुरक्षा', 'पुलिस', 'क्राइम न्यूज़'],
    },
  }),
]

function createArticleRecord(
  input: Omit<Article, 'images' | 'status' | 'updatedAt'> & {
    imageSlug: string
  },
): ArticleRecord {
  const updatedAt = input.publishDate

  return {
    pk: 'ARTICLE',
    sk: `PUBLISHED#${input.publishDate}#${input.articleId}`,
    articleId: input.articleId,
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    body: input.body,
    images: [
      {
        url: `${mediaBaseUrl}/articles/2026/07/01/${input.imageSlug}/primary.webp`,
        altText: input.title,
        caption: input.summary,
        credit: 'सोनवाणी',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    youtubeVideoId: input.youtubeVideoId,
    reporterName: input.reporterName,
    category: input.category,
    categorySlug: input.categorySlug,
    district: input.district,
    districtSlug: input.districtSlug,
    state: input.state,
    stateSlug: input.stateSlug,
    publishDate: input.publishDate,
    updatedAt,
    isBreaking: input.isBreaking,
    isFeatured: input.isFeatured,
    status: 'PUBLISHED',
    seo: input.seo,
    createdAt: input.publishDate,
    createdBy: 'owner',
    updatedBy: 'owner',
    ...(input.isBreaking ? { breakingPartition: 'BREAKING' as const } : {}),
    ...(input.isFeatured ? { featuredPartition: 'FEATURED' as const } : {}),
  }
}

async function seedSampleArticles(): Promise<void> {
  if (dryRun) {
    console.log(JSON.stringify(sampleArticles, null, 2))
    return
  }

  const tableName = getRequiredEnv('ARTICLES_TABLE_NAME')

  await dynamoDbDocumentClient.send(
    new BatchWriteCommand({
      RequestItems: {
        [tableName]: sampleArticles.map((article) => ({
          PutRequest: {
            Item: article,
          },
        })),
      },
    }),
  )

  console.log(`Seeded ${sampleArticles.length} sample Hindi articles into ${tableName}.`)
}

await seedSampleArticles()
