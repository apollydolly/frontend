export const loadSpeechData = async (
  url = "/data/meet_meating_features.json",
) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Ошибка загрузки JSON:", error);
    return null;
  }
};
