const STORAGE_KEY = "edupredict_assessments";



export function getAssessments() {

  const saved =
    localStorage.getItem(
      STORAGE_KEY
    );

  if (!saved) {
    return [];
  }

  try {

    return JSON.parse(saved);

  } catch (error) {

    console.error(
      "Could not read assessments:",
      error
    );

    return [];
  }
}



// SAVE ASSESSMENT
// ============================================================

export function saveAssessment(
  assessment
) {

  const existing =
    getAssessments();


  const updated = [
    assessment,
    ...existing
  ];


  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated)
  );


  return assessment;
}




export function getStudentAssessments(
  studentId
) {

  return getAssessments().filter(
    (assessment) =>
      assessment.studentId ===
        studentId ||
      assessment.id === studentId
  );
}



export function saveReassessment(
  studentId,
  reassessment
) {

  const existing =
    getAssessments();


  const updated = [
    {
      ...reassessment,

      studentId,

      id:
        reassessment.id ||
        `ASSESS-${Date.now()}`,

      createdAt:
        reassessment.createdAt ||
        new Date().toISOString(),
    },

    ...existing,
  ];


  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated)
  );
}



export function clearAssessments() {

  localStorage.removeItem(
    STORAGE_KEY
  );
}