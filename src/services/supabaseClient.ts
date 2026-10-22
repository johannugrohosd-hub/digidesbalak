export function mapSnakeToLetterRequest(data: any) {
  if (!data) return null;
  return {
    ...data,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    applicantName: data.applicant_name,
    letterType: data.letter_type,
  };
}

export function mapSnakeToComplaint(data: any) {
  if (!data) return null;
  return {
    ...data,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
