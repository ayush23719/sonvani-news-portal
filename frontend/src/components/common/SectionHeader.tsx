import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { Box, Button, Typography } from '@mui/material'

type SectionHeaderProps = {
  title: string
  eyebrow?: string
  href?: string
}

export function SectionHeader({ title, eyebrow, href }: SectionHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        mb: 2,
        flexWrap: 'wrap',
        alignItems: 'end',
        justifyContent: 'space-between',
        minWidth: 0,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {eyebrow ? (
          <Typography color="secondary" sx={{ fontSize: '0.82rem', fontWeight: 800, mb: 0.5 }}>
            {eyebrow}
          </Typography>
        ) : null}
        <Typography
          component="h2"
          variant="h2"
          sx={{ fontSize: { xs: '1.35rem', sm: '1.5rem', md: '1.65rem' }, overflowWrap: 'anywhere' }}
        >
          {title}
        </Typography>
      </Box>
      {href ? (
        <Button
          href={href}
          endIcon={<ArrowForwardIosIcon sx={{ fontSize: 14 }} />}
          size="small"
          sx={{ minHeight: 40, whiteSpace: 'nowrap' }}
        >
          और पढ़ें
        </Button>
      ) : null}
    </Box>
  )
}
