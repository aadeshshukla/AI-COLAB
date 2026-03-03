export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { rollNumber } = req.query || {}

  if (!rollNumber) {
    return res.status(400).json({ message: 'rollNumber is required' })
  }

  try {
    const upstream = await fetch(
      `https://jntuhresults.dhethi.com/api/getAcademicResult?rollNumber=${encodeURIComponent(rollNumber)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      }
    )

    const text = await upstream.text()
    let data

    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text || 'Invalid response from upstream API' }
    }

    return res.status(upstream.status).json(data)
  } catch {
    return res.status(502).json({ message: 'Unable to fetch upstream results API' })
  }
}
