import { Container, Paper, Stack, Typography } from '@mui/material'
import { useEffect } from 'react'

export function EditorialPolicyPage() {
  useEffect(() => {
    document.title = 'संपादकीय नीति | सोनवाणी'
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
            संपादकीय नीति
          </Typography>

          <Typography>
            सोन वाणी न्यूज़ निष्पक्ष, तथ्यपरक एवं जिम्मेदार पत्रकारिता के सिद्धांतों का
            पालन करता है।
          </Typography>

          <Section
            title="तथ्य आधारित रिपोर्टिंग"
            body="प्रत्येक समाचार उपलब्ध स्रोतों के आधार पर सत्यापित करने का प्रयास किया जाता है।"
          />

          <Section
            title="निष्पक्षता"
            body="हम किसी राजनीतिक दल, संस्था अथवा व्यक्ति के पक्ष या विपक्ष में पूर्वाग्रहपूर्ण सामग्री प्रकाशित नहीं करते।"
          />

          <Section
            title="सुधार नीति"
            body="यदि किसी समाचार में तथ्यात्मक त्रुटि पाई जाती है, तो उचित समीक्षा के बाद आवश्यक संशोधन शीघ्र किया जाता है।"
          />

          <Section
            title="स्रोतों की सुरक्षा"
            body="जहाँ आवश्यक हो, पत्रकारिता के नैतिक मानकों के अनुरूप स्रोतों की गोपनीयता का सम्मान किया जाता है।"
          />

          <Section
            title="विज्ञापन एवं संपादकीय सामग्री"
            body="विज्ञापन और संपादकीय सामग्री को स्पष्ट रूप से अलग रखा जाता है ताकि पाठकों को किसी प्रकार का भ्रम न हो।"
          />

          <Section
            title="आचार संहिता"
            body="हम भारतीय पत्रकारिता के नैतिक मानकों तथा जिम्मेदार डिजिटल मीडिया प्रथाओं का पालन करने के लिए प्रतिबद्ध हैं।"
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
