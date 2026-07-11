import { Container, Paper, Stack, Typography } from '@mui/material'
import { useEffect } from 'react'

export function TermsPage() {
  useEffect(() => {
    document.title = 'नियम एवं शर्तें | सोनवाणी'
  }, [])

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      <Paper
        elevation={0}
        sx={{ p: { xs: 3, md: 5 }, border: 1, borderColor: 'divider' }}
      >
        <Stack spacing={3}>
          <Typography
            variant="h1"
            sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 800 }}
          >
            नियम एवं शर्तें
          </Typography>

          <Typography color="text.secondary">
            प्रभावी तिथि: <strong>9 जुलाई 2026</strong>
          </Typography>

          <Section
            title="1. वेबसाइट का उपयोग"
            body="इस वेबसाइट का उपयोग करते समय आप सभी लागू भारतीय कानूनों एवं इन नियमों का पालन करने के लिए सहमत होते हैं।"
          />

          <Section
            title="2. सामग्री का उपयोग"
            body="वेबसाइट पर प्रकाशित समाचार, चित्र, वीडियो, ग्राफिक्स एवं अन्य सामग्री केवल व्यक्तिगत एवं गैर-व्यावसायिक उपयोग के लिए उपलब्ध है। पूर्व लिखित अनुमति के बिना पुनर्प्रकाशन प्रतिबंधित है।"
          />

          <Section
            title="3. बौद्धिक संपदा"
            body="सोन वाणी न्यूज़ का लोगो, डिज़ाइन, सामग्री एवं अन्य बौद्धिक संपदा संबंधित कॉपीराइट एवं अन्य कानूनों द्वारा संरक्षित है।"
          />

          <Section
            title="4. निषिद्ध गतिविधियाँ"
            body="वेबसाइट का उपयोग किसी अवैध, भ्रामक, अपमानजनक अथवा साइबर सुरक्षा को प्रभावित करने वाली गतिविधियों के लिए नहीं किया जा सकता।"
          />

          <Section
            title="5. सेवाओं में परिवर्तन"
            body="हम बिना पूर्व सूचना के वेबसाइट की किसी भी सेवा, सुविधा या सामग्री में परिवर्तन अथवा उसे बंद करने का अधिकार सुरक्षित रखते हैं।"
          />

          <Section
            title="6. अधिकार क्षेत्र"
            body="इन नियमों से संबंधित किसी भी विवाद का समाधान भारत के लागू कानूनों के अनुसार किया जाएगा।"
          />
        </Stack>
      </Paper>
    </Container>
  )
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <Stack spacing={1}>
      <Typography sx={{ fontWeight: 700, fontSize: '1.15rem' }}>{title}</Typography>
      <Typography color="text.secondary">{body}</Typography>
    </Stack>
  )
}
