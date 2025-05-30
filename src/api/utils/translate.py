import requests
from langdetect import detect, LangDetectException

def detect_language(text):

    """
    Detect language code of input text using langdetect.
    Returns ISO 639-1 language code like 'en', 'es', etc.
    If detection fails, defaults to 'en'.
    """
    try:
        lang = detect(text)
        return lang
    except LangDetectException:
        return "en"

def translate_to_english_mymemory(text, source_lang="auto", target_lang="en"):
    """
    Translate `text` from source_lang to target_lang using MyMemory API.
    If source_lang is 'auto', it detects language automatically.
    """
    if source_lang == "auto":
        source_lang = detect_language(text)
    if source_lang == 'en':
        return text

    url = "https://api.mymemory.translated.net/get"
    params = {
        "q": text,
        "langpair": f"{source_lang}|{target_lang}"
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        translated_text = data.get("responseData", {}).get("translatedText")
        return translated_text if translated_text else text
    except Exception as e:
        # Fallback to original text on error
        return text
