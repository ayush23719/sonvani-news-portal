import { BatchWriteCommand, type BatchWriteCommandInput } from '@aws-sdk/lib-dynamodb'
import { dynamoDbDocumentClient } from '../../shared/clients/dynamodb.js'
import { getRequiredEnv } from '../../shared/env/environment.js'
import type { Article, SeoMetadata } from '../../shared/types/news.js'

type ArticleRecord = Article & {
  pk: 'ARTICLE'
  sk: string
  createdAt: string
  createdBy: string
  updatedBy: string
  breakingPartition?: 'BREAKING'
  featuredPartition?: 'FEATURED'
}

type SeedArticleInput = Omit<Article, 'articleId' | 'images' | 'status' | 'updatedAt'> & {
  articleId: string
  imageSlug: string
  seo: SeoMetadata
}

const dryRun = process.argv.includes('--dry-run')
const mediaBaseUrl = process.env.MEDIA_BASE_URL ?? 'https://media.example.com'

const articleInputs: SeedArticleInput[] = [
  {
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
    seo: createSeo('सोनभद्र विकास कार्य समीक्षा', 'सोनभद्र में विकास कार्यों की समीक्षा और प्रशासनिक निर्देश।'),
  },
  {
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
    publishDate: '2026-07-01T05:05:00.000Z',
    isBreaking: false,
    isFeatured: true,
    imageSlug: 'varanasi-ghaton-par-swachhta-abhiyan',
    seo: createSeo('वाराणसी घाट स्वच्छता अभियान', 'वाराणसी के घाटों पर चलाए गए स्वच्छता अभियान की जानकारी।'),
  },
  {
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
    publishDate: '2026-07-01T04:40:00.000Z',
    isBreaking: true,
    isFeatured: false,
    imageSlug: 'lucknow-suraksha-vyavastha-samiksha',
    seo: createSeo('लखनऊ सुरक्षा व्यवस्था समीक्षा', 'लखनऊ में सुरक्षा व्यवस्था और पुलिस गश्त से जुड़ी खबर।'),
  },
  {
    articleId: 'sample-article-004',
    slug: 'prayagraj-mela-traffic-route-update',
    title: 'प्रयागराज में मेले की तैयारी तेज, यातायात रूट में बदलाव लागू',
    summary: 'प्रशासन ने प्रमुख मार्गों पर डायवर्जन और पार्किंग व्यवस्था जारी की।',
    body:
      'प्रयागराज में मेले की तैयारियों को लेकर यातायात विभाग ने नई व्यवस्था लागू की है। श्रद्धालुओं की सुविधा के लिए वैकल्पिक मार्ग तय किए गए हैं।',
    reporterName: 'प्रयागराज ब्यूरो',
    category: 'राज्य',
    categorySlug: 'rajya',
    district: 'प्रयागराज',
    districtSlug: 'prayagraj',
    state: 'उत्तर प्रदेश',
    stateSlug: 'uttar-pradesh',
    publishDate: '2026-07-01T04:05:00.000Z',
    isBreaking: false,
    isFeatured: true,
    imageSlug: 'prayagraj-mela-traffic-route-update',
    seo: createSeo('प्रयागराज मेला ट्रैफिक अपडेट', 'प्रयागराज मेले के दौरान यातायात रूट और पार्किंग की जानकारी।'),
  },
  {
    articleId: 'sample-article-005',
    slug: 'patna-school-timing-badalav',
    title: 'पटना में स्कूलों की समय-सारिणी बदली, गर्मी को देखते हुए आदेश जारी',
    summary: 'जिला प्रशासन ने सभी सरकारी और निजी विद्यालयों को निर्देश भेजे।',
    body:
      'पटना में तापमान बढ़ने के बाद स्कूलों की समय-सारिणी में बदलाव किया गया है। आदेश का पालन सुनिश्चित कराने के लिए शिक्षा विभाग निगरानी करेगा।',
    reporterName: 'पटना संवाददाता',
    category: 'शिक्षा',
    categorySlug: 'education',
    district: 'पटना',
    districtSlug: 'patna',
    state: 'बिहार',
    stateSlug: 'bihar',
    publishDate: '2026-07-01T03:45:00.000Z',
    isBreaking: true,
    isFeatured: false,
    imageSlug: 'patna-school-timing-badalav',
    seo: createSeo('पटना स्कूल समय बदलाव', 'पटना में गर्मी के कारण स्कूलों की समय-सारिणी बदली।'),
  },
  {
    articleId: 'sample-article-006',
    slug: 'ranchi-swasthya-shivir-gramin-ilake',
    title: 'रांची के ग्रामीण इलाकों में स्वास्थ्य शिविर, सैकड़ों मरीजों की जांच',
    summary: 'डॉक्टरों ने मुफ्त परामर्श और दवाएं उपलब्ध कराईं।',
    body:
      'रांची के ग्रामीण क्षेत्रों में स्वास्थ्य विभाग ने विशेष शिविर लगाया। शिविर में सामान्य जांच, महिला स्वास्थ्य और बच्चों के टीकाकरण पर ध्यान दिया गया।',
    reporterName: 'रांची ब्यूरो',
    category: 'स्वास्थ्य',
    categorySlug: 'swasthya',
    district: 'रांची',
    districtSlug: 'ranchi',
    state: 'झारखंड',
    stateSlug: 'jharkhand',
    publishDate: '2026-07-01T03:20:00.000Z',
    isBreaking: false,
    isFeatured: true,
    imageSlug: 'ranchi-swasthya-shivir-gramin-ilake',
    seo: createSeo('रांची ग्रामीण स्वास्थ्य शिविर', 'रांची के ग्रामीण इलाकों में स्वास्थ्य शिविर और जांच।'),
  },
  {
    articleId: 'sample-article-007',
    slug: 'bhopal-barish-alert-nagar-nigam-taiyari',
    title: 'भोपाल में तेज बारिश का अलर्ट, नगर निगम ने कंट्रोल रूम सक्रिय किया',
    summary: 'जलभराव वाले इलाकों में टीमों को तैनात रहने के निर्देश दिए गए।',
    body:
      'भोपाल में मौसम विभाग के अलर्ट के बाद नगर निगम ने कंट्रोल रूम सक्रिय कर दिया है। निचले इलाकों में जलभराव से निपटने की तैयारी की गई है।',
    reporterName: 'भोपाल डेस्क',
    category: 'मौसम',
    categorySlug: 'weather',
    district: 'भोपाल',
    districtSlug: 'bhopal',
    state: 'मध्य प्रदेश',
    stateSlug: 'madhya-pradesh',
    publishDate: '2026-07-01T02:55:00.000Z',
    isBreaking: true,
    isFeatured: true,
    imageSlug: 'bhopal-barish-alert-nagar-nigam-taiyari',
    seo: createSeo('भोपाल बारिश अलर्ट', 'भोपाल में तेज बारिश के अलर्ट के बाद नगर निगम की तैयारी।'),
  },
  {
    articleId: 'sample-article-008',
    slug: 'jaipur-paryatan-sthalon-par-suraksha',
    title: 'जयपुर के पर्यटन स्थलों पर सुरक्षा बढ़ी, गाइडलाइन जारी',
    summary: 'पर्यटकों की सुविधा के लिए हेल्प डेस्क और अतिरिक्त गश्त की व्यवस्था।',
    body:
      'जयपुर में पर्यटन सीजन को देखते हुए प्रमुख स्थलों पर सुरक्षा व्यवस्था बढ़ाई गई है। पुलिस और पर्यटन विभाग ने संयुक्त गाइडलाइन जारी की है।',
    reporterName: 'जयपुर संवाददाता',
    category: 'पर्यटन',
    categorySlug: 'tourism',
    district: 'जयपुर',
    districtSlug: 'jaipur',
    state: 'राजस्थान',
    stateSlug: 'rajasthan',
    publishDate: '2026-07-01T02:30:00.000Z',
    isBreaking: false,
    isFeatured: false,
    imageSlug: 'jaipur-paryatan-sthalon-par-suraksha',
    seo: createSeo('जयपुर पर्यटन सुरक्षा', 'जयपुर के पर्यटन स्थलों पर सुरक्षा और नई गाइडलाइन।'),
  },
  {
    articleId: 'sample-article-009',
    slug: 'delhi-metro-sewa-me-badalav',
    title: 'दिल्ली मेट्रो सेवा में बदलाव, यात्रियों के लिए नई एडवाइजरी जारी',
    summary: 'कुछ रूटों पर रखरखाव कार्य के कारण समय में बदलाव रहेगा।',
    body:
      'दिल्ली मेट्रो ने रखरखाव कार्य को देखते हुए यात्रियों के लिए एडवाइजरी जारी की है। यात्रियों से यात्रा शुरू करने से पहले रूट अपडेट देखने की अपील की गई है।',
    reporterName: 'दिल्ली डेस्क',
    category: 'देश',
    categorySlug: 'desh',
    district: 'नई दिल्ली',
    districtSlug: 'new-delhi',
    state: 'दिल्ली',
    stateSlug: 'delhi',
    publishDate: '2026-07-01T02:05:00.000Z',
    isBreaking: false,
    isFeatured: true,
    imageSlug: 'delhi-metro-sewa-me-badalav',
    seo: createSeo('दिल्ली मेट्रो सेवा बदलाव', 'दिल्ली मेट्रो सेवा में बदलाव और यात्रियों के लिए एडवाइजरी।'),
  },
  {
    articleId: 'sample-article-010',
    slug: 'sonbhadra-khel-samaroh-yuva-khiladi-sammanit',
    title: 'सोनभद्र में खेल समारोह, युवा खिलाड़ियों को सम्मानित किया गया',
    summary: 'जिला स्टेडियम में आयोजित कार्यक्रम में खिलाड़ियों का उत्साह बढ़ाया गया।',
    body:
      'सोनभद्र में जिला स्तरीय खेल समारोह का आयोजन किया गया। बेहतर प्रदर्शन करने वाले युवा खिलाड़ियों को प्रमाणपत्र और मेडल देकर सम्मानित किया गया।',
    reporterName: 'खेल डेस्क',
    category: 'खेल',
    categorySlug: 'khel',
    district: 'सोनभद्र',
    districtSlug: 'sonbhadra',
    state: 'उत्तर प्रदेश',
    stateSlug: 'uttar-pradesh',
    publishDate: '2026-07-01T01:40:00.000Z',
    isBreaking: false,
    isFeatured: false,
    imageSlug: 'sonbhadra-khel-samaroh-yuva-khiladi-sammanit',
    seo: createSeo('सोनभद्र खेल समारोह', 'सोनभद्र में युवा खिलाड़ियों को सम्मानित किया गया।'),
  },
  {
    articleId: 'sample-article-011',
    slug: 'varanasi-mandir-parisar-vyavastha',
    title: 'वाराणसी में मंदिर परिसर की व्यवस्था सुधरी, श्रद्धालुओं को मिलेगी राहत',
    summary: 'भीड़ प्रबंधन और साफ-सफाई को लेकर नई व्यवस्था लागू की गई।',
    body:
      'वाराणसी में मंदिर परिसर में श्रद्धालुओं की सुविधा के लिए नई व्यवस्था लागू की गई है। प्रशासन ने कतार प्रबंधन और साफ-सफाई पर विशेष ध्यान दिया है।',
    reporterName: 'धर्म डेस्क',
    category: 'धर्म',
    categorySlug: 'dharm',
    district: 'वाराणसी',
    districtSlug: 'varanasi',
    state: 'उत्तर प्रदेश',
    stateSlug: 'uttar-pradesh',
    publishDate: '2026-06-30T16:30:00.000Z',
    isBreaking: false,
    isFeatured: true,
    imageSlug: 'varanasi-mandir-parisar-vyavastha',
    seo: createSeo('वाराणसी मंदिर व्यवस्था', 'वाराणसी में मंदिर परिसर की व्यवस्था और श्रद्धालुओं की सुविधा।'),
  },
  {
    articleId: 'sample-article-012',
    slug: 'lucknow-startup-nivesh-sammelan',
    title: 'लखनऊ में स्टार्टअप निवेश सम्मेलन, युवाओं को नए अवसर मिलेंगे',
    summary: 'तकनीक और सेवा क्षेत्र से जुड़े उद्यमियों ने अपने मॉडल प्रस्तुत किए।',
    body:
      'लखनऊ में आयोजित स्टार्टअप निवेश सम्मेलन में कई युवा उद्यमियों ने हिस्सा लिया। निवेशकों ने स्थानीय नवाचारों में रुचि दिखाई है।',
    reporterName: 'बिजनेस डेस्क',
    category: 'बिजनेस',
    categorySlug: 'business',
    district: 'लखनऊ',
    districtSlug: 'lucknow',
    state: 'उत्तर प्रदेश',
    stateSlug: 'uttar-pradesh',
    publishDate: '2026-06-30T15:50:00.000Z',
    isBreaking: false,
    isFeatured: false,
    imageSlug: 'lucknow-startup-nivesh-sammelan',
    seo: createSeo('लखनऊ स्टार्टअप निवेश सम्मेलन', 'लखनऊ में स्टार्टअप और निवेश सम्मेलन की खबर।'),
  },
  {
    articleId: 'sample-article-013',
    slug: 'patna-cyber-thagi-jagrukta-abhiyaan',
    title: 'पटना में साइबर ठगी से बचाव के लिए जागरूकता अभियान',
    summary: 'विशेषज्ञों ने ओटीपी और बैंक जानकारी साझा न करने की अपील की।',
    body:
      'पटना में साइबर अपराध से बचाव के लिए जागरूकता कार्यक्रम आयोजित किया गया। पुलिस ने लोगों को संदिग्ध लिंक और कॉल से सावधान रहने को कहा है।',
    reporterName: 'क्राइम रिपोर्टर',
    category: 'क्राइम',
    categorySlug: 'crime',
    district: 'पटना',
    districtSlug: 'patna',
    state: 'बिहार',
    stateSlug: 'bihar',
    publishDate: '2026-06-30T15:10:00.000Z',
    isBreaking: false,
    isFeatured: false,
    imageSlug: 'patna-cyber-thagi-jagrukta-abhiyaan',
    seo: createSeo('पटना साइबर ठगी जागरूकता', 'पटना में साइबर ठगी से बचाव के लिए अभियान।'),
  },
  {
    articleId: 'sample-article-014',
    slug: 'ranchi-vidhansabha-satra-taiyari',
    title: 'रांची में विधानसभा सत्र की तैयारी, सुरक्षा और यातायात प्लान तैयार',
    summary: 'अधिकारियों ने परिसर और आसपास के इलाकों का निरीक्षण किया।',
    body:
      'रांची में विधानसभा सत्र को लेकर प्रशासन ने तैयारी तेज कर दी है। सुरक्षा, यातायात और पार्किंग व्यवस्था के लिए अलग-अलग टीमों को जिम्मेदारी दी गई है।',
    reporterName: 'राजनीति डेस्क',
    category: 'राजनीति',
    categorySlug: 'rajniti',
    district: 'रांची',
    districtSlug: 'ranchi',
    state: 'झारखंड',
    stateSlug: 'jharkhand',
    publishDate: '2026-06-30T14:30:00.000Z',
    isBreaking: true,
    isFeatured: false,
    imageSlug: 'ranchi-vidhansabha-satra-taiyari',
    seo: createSeo('रांची विधानसभा सत्र तैयारी', 'रांची में विधानसभा सत्र की सुरक्षा और यातायात तैयारी।'),
  },
  {
    articleId: 'sample-article-015',
    slug: 'bhopal-aspatal-opd-vyavastha',
    title: 'भोपाल जिला अस्पताल में नई ओपीडी व्यवस्था, मरीजों को मिलेगी राहत',
    summary: 'ऑनलाइन पर्ची और अलग काउंटर की सुविधा शुरू की गई।',
    body:
      'भोपाल जिला अस्पताल में मरीजों की सुविधा के लिए ओपीडी व्यवस्था में बदलाव किया गया है। नई व्यवस्था से पंजीकरण और परामर्श में लगने वाला समय कम होगा।',
    reporterName: 'स्वास्थ्य संवाददाता',
    category: 'स्वास्थ्य',
    categorySlug: 'swasthya',
    district: 'भोपाल',
    districtSlug: 'bhopal',
    state: 'मध्य प्रदेश',
    stateSlug: 'madhya-pradesh',
    publishDate: '2026-06-30T13:40:00.000Z',
    isBreaking: false,
    isFeatured: true,
    imageSlug: 'bhopal-aspatal-opd-vyavastha',
    seo: createSeo('भोपाल अस्पताल ओपीडी व्यवस्था', 'भोपाल जिला अस्पताल में नई ओपीडी व्यवस्था।'),
  },
  {
    articleId: 'sample-article-016',
    slug: 'jaipur-bijli-aapurti-maintenance',
    title: 'जयपुर में बिजली आपूर्ति पर असर, रखरखाव कार्य का शेड्यूल जारी',
    summary: 'कई इलाकों में तय समय के लिए बिजली कटौती रहेगी।',
    body:
      'जयपुर में बिजली विभाग ने रखरखाव कार्य का शेड्यूल जारी किया है। उपभोक्ताओं से जरूरी तैयारी रखने की अपील की गई है।',
    reporterName: 'जयपुर डेस्क',
    category: 'स्थानीय',
    categorySlug: 'local',
    district: 'जयपुर',
    districtSlug: 'jaipur',
    state: 'राजस्थान',
    stateSlug: 'rajasthan',
    publishDate: '2026-06-30T12:55:00.000Z',
    isBreaking: false,
    isFeatured: false,
    imageSlug: 'jaipur-bijli-aapurti-maintenance',
    seo: createSeo('जयपुर बिजली आपूर्ति शेड्यूल', 'जयपुर में बिजली आपूर्ति और रखरखाव शेड्यूल।'),
  },
  {
    articleId: 'sample-article-017',
    slug: 'delhi-technology-policy-baithak',
    title: 'दिल्ली में तकनीक नीति पर बैठक, डिजिटल सेवाओं को बेहतर करने पर जोर',
    summary: 'सरकारी सेवाओं को ऑनलाइन और सरल बनाने के प्रस्तावों पर चर्चा हुई।',
    body:
      'दिल्ली में तकनीक नीति से जुड़ी बैठक में डिजिटल सेवाओं को तेज और सरल बनाने पर चर्चा हुई। विभागों से नागरिक सेवाओं की प्रक्रिया कम करने को कहा गया है।',
    reporterName: 'टेक्नोलॉजी डेस्क',
    category: 'टेक्नोलॉजी',
    categorySlug: 'technology',
    district: 'नई दिल्ली',
    districtSlug: 'new-delhi',
    state: 'दिल्ली',
    stateSlug: 'delhi',
    publishDate: '2026-06-30T12:20:00.000Z',
    isBreaking: false,
    isFeatured: true,
    imageSlug: 'delhi-technology-policy-baithak',
    seo: createSeo('दिल्ली तकनीक नीति बैठक', 'दिल्ली में डिजिटल सेवाओं और तकनीक नीति पर बैठक।'),
  },
  {
    articleId: 'sample-article-018',
    slug: 'prayagraj-kisan-yojana-panjikaran',
    title: 'प्रयागराज में किसान योजना का पंजीकरण शुरू, शिविरों में मिलेगी सहायता',
    summary: 'कृषि विभाग ने ब्लॉक स्तर पर हेल्प डेस्क बनाने की तैयारी की।',
    body:
      'प्रयागराज में किसान योजना के लिए पंजीकरण प्रक्रिया शुरू कर दी गई है। किसानों को दस्तावेज और ऑनलाइन आवेदन में मदद के लिए शिविर लगाए जाएंगे।',
    reporterName: 'कृषि संवाददाता',
    category: 'बिजनेस',
    categorySlug: 'business',
    district: 'प्रयागराज',
    districtSlug: 'prayagraj',
    state: 'उत्तर प्रदेश',
    stateSlug: 'uttar-pradesh',
    publishDate: '2026-06-30T11:45:00.000Z',
    isBreaking: false,
    isFeatured: false,
    imageSlug: 'prayagraj-kisan-yojana-panjikaran',
    seo: createSeo('प्रयागराज किसान योजना पंजीकरण', 'प्रयागराज में किसान योजना पंजीकरण और सहायता शिविर।'),
  },
]

const sampleArticles = articleInputs.map(createArticleRecord)

function createSeo(title: string, description: string): SeoMetadata {
  return {
    title: `${title} | सोनवाणी`,
    description,
    keywords: ['सोनवाणी', 'हिंदी समाचार', title],
  }
}

function createArticleRecord(input: SeedArticleInput): ArticleRecord {
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
        url: `${mediaBaseUrl}/articles/${toMediaDatePath(input.publishDate)}/${input.imageSlug}/primary.webp`,
        altText: input.title,
        caption: input.summary,
        credit: 'सोनवाणी',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        url: `${mediaBaseUrl}/articles/${toMediaDatePath(input.publishDate)}/${input.imageSlug}/thumbnail.webp`,
        altText: `${input.title} थंबनेल`,
        caption: input.summary,
        credit: 'सोनवाणी',
        sortOrder: 2,
        isPrimary: false,
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
    updatedAt: input.publishDate,
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

function toMediaDatePath(publishDate: string): string {
  return publishDate.slice(0, 10).replaceAll('-', '/')
}

async function seedSampleArticles(): Promise<void> {
  if (dryRun) {
    console.log(JSON.stringify(sampleArticles, null, 2))
    return
  }

  const tableName = getRequiredEnv('ARTICLES_TABLE_NAME')
  await batchWriteArticles(tableName, sampleArticles)
  console.log(`Seeded ${sampleArticles.length} sample Hindi articles into ${tableName}.`)
}

async function batchWriteArticles(tableName: string, articles: ArticleRecord[]): Promise<void> {
  const request: BatchWriteCommandInput = {
    RequestItems: {
      [tableName]: articles.map((article) => ({
        PutRequest: {
          Item: article,
        },
      })),
    },
  }

  let unprocessedItems = request.RequestItems
  let attempt = 0

  while (unprocessedItems && Object.keys(unprocessedItems).length > 0) {
    const result = await dynamoDbDocumentClient.send(
      new BatchWriteCommand({
        RequestItems: unprocessedItems,
      }),
    )

    unprocessedItems = result.UnprocessedItems

    if (unprocessedItems && Object.keys(unprocessedItems).length > 0) {
      attempt += 1
      await wait(100 * 2 ** attempt)
    }
  }
}

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

await seedSampleArticles()
