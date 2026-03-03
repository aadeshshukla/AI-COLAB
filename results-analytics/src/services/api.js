import axios from 'axios'

const BASE_URL = 'https://jntuhresults.dhethi.com/api/getAcademicResult'

export async function fetchAcademicResult(rollNumber) {
  const response = await axios.get(BASE_URL, {
    params: { rollNumber },
  })
  return response.data
}
