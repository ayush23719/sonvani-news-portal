import { Container, Paper, Stack, Typography } from '@mui/material'
import { useEffect } from 'react'

export function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = 'गोपनीयता नीति | सोनवाणी'
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
            गोपनीयता नीति
          </Typography>

          <Typography color="text.secondary">
            प्रभावी तिथि: <strong>9 जुलाई 2026</strong>
          </Typography>

          <Typography>
            सोन वाणी न्यूज़ अपने पाठकों की गोपनीयता का सम्मान करता है। यह नीति बताती है कि
            वेबसाइट का उपयोग करते समय कौन-सी जानकारी एकत्र की जा सकती है तथा उसका उपयोग
            किस प्रकार किया जाता है।
          </Typography>

          <Section
            title="1. एकत्रित की जाने वाली जानकारी"
            body="जब आप हमसे संपर्क करते हैं, ईमेल भेजते हैं अथवा कोई जानकारी साझा करते हैं, तब आपका नाम, ईमेल पता अथवा अन्य आवश्यक जानकारी प्राप्त हो सकती है।"
          />

          <Section
            title="2. जानकारी का उपयोग"
            body="एकत्रित जानकारी का उपयोग केवल आपके प्रश्नों का उत्तर देने, वेबसाइट की सेवाओं में सुधार करने तथा आवश्यक प्रशासनिक कार्यों के लिए किया जाता है।"
          />

          <Section
            title="3. कुकीज़ (Cookies)"
            body="वेबसाइट उपयोगकर्ता अनुभव बेहतर बनाने के लिए कुकीज़ का उपयोग कर सकती है। आप चाहें तो अपने ब्राउज़र की सेटिंग से इन्हें नियंत्रित या निष्क्रिय कर सकते हैं।"
          />

          <Section
            title="4. तृतीय पक्ष सेवाएँ"
            body="हमारी वेबसाइट विश्लेषण (Analytics), विज्ञापन अथवा अन्य सेवाओं के लिए तृतीय पक्ष सेवाओं का उपयोग कर सकती है। ऐसी सेवाओं की अपनी गोपनीयता नीतियाँ होती हैं।"
          />

          <Section
            title="5. डेटा सुरक्षा"
            body="हम उपयोगकर्ताओं की जानकारी की सुरक्षा के लिए उचित तकनीकी एवं प्रशासनिक उपाय अपनाते हैं।"
          />

          <Section
            title="6. नीति में परिवर्तन"
            body="आवश्यकता पड़ने पर इस गोपनीयता नीति में संशोधन किया जा सकता है। संशोधित नीति इस पृष्ठ पर प्रकाशित होते ही प्रभावी होगी।"
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
