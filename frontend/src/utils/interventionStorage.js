const KEY_PREFIX =
  "edupredict_interventions_";


export function getInterventions(studentId) {
  const key =
    `${KEY_PREFIX}${studentId}`;

  const saved =
    localStorage.getItem(key);

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.error(
      "Failed to load interventions:",
      error
    );

    return null;
  }
}


export function saveInterventions(
  studentId,
  interventions
) {
  const key =
    `${KEY_PREFIX}${studentId}`;

  localStorage.setItem(
    key,
    JSON.stringify(interventions)
  );
}


export function clearInterventions(
  studentId
) {
  localStorage.removeItem(
    `${KEY_PREFIX}${studentId}`
  );
}