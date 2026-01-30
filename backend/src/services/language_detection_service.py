import re
from typing import Dict, Any

class LanguageDetectionService:
    """
    Service for detecting language in user input (English, Urdu, Roman Urdu)
    """

    def __init__(self):
        # Urdu Unicode range
        self.urdu_pattern = re.compile(r'[\u0600-\u06FF]+')

        # Common Roman Urdu words/phrases (transliterated)
        self.roman_urdu_keywords = {
            'kaam', 'kaaj', 'kam', 'task', 'kaam_karna', 'karna', 'kar', 'krna',
            'hai', 'hy', 'ho', 'hota', 'kr', 'kro', 'karo', 'karay', 'kray',
            'main', 'mein', 'mai', 'may', 'mn', 'ap', 'aap', 'tum', 'tumlog',
            'hum', 'hm', 'ye', 'wo', 'vo', 'iss', 'yeh', 'woh', 'voh',
            'kya', 'kyun', 'kese', 'kesa', 'kab', 'kahan', 'q', 'kia',
            'thoda', 'thora', 'ziada', 'zyada', 'achha', 'accha', 'behtareen',
            'waqt', 'samay', 'din', 'raat', 'rat', 'subha', 'shaam', 'sham',
            'hai', 'hain', 'tha', 'thi', 'they', 'thay', 'hogha', 'hogi',
            'chahiye', 'chahie', 'chahte', 'chahti', 'chahta', 'jana', 'jaana',
            'ana', 'aana', 'jao', 'jaao', 'ao', 'aao', 'karunga', 'karogi',
            'karogi', 'karne', 'karney', 'kaam', 'maal', 'cheez', 'chiz'
        }

    def detect_language(self, text: str) -> str:
        """
        Detect the language of the input text

        Args:
            text: Input text to analyze

        Returns:
            Detected language ('english', 'urdu', 'roman_urdu', or 'unknown')
        """
        if not text or not isinstance(text, str):
            return 'unknown'

        text_lower = text.lower()
        text_clean = re.sub(r'[^\w\s]', ' ', text_lower)
        words = text_clean.split()

        # Check for Urdu script (Arabic/Persian characters)
        urdu_chars = self.urdu_pattern.findall(text)
        if urdu_chars:
            # If more than 20% of the text contains Urdu characters, it's Urdu
            urdu_char_count = sum(len(urdu_char) for urdu_char in urdu_chars)
            total_char_count = len(text)
            if total_char_count > 0 and (urdu_char_count / total_char_count) > 0.2:
                return 'urdu'

        # Count Roman Urdu keywords
        roman_urdu_count = 0
        for word in words:
            if word in self.roman_urdu_keywords:
                roman_urdu_count += 1

        # If 20% or more of words are Roman Urdu keywords, classify as Roman Urdu
        if len(words) > 0 and (roman_urdu_count / len(words)) >= 0.2:
            return 'roman_urdu'

        # Default to English if no other language detected
        return 'english'

    def preprocess_input(self, text: str, target_lang: str = None) -> str:
        """
        Preprocess input text based on detected language

        Args:
            text: Input text to preprocess
            target_lang: Target language (optional)

        Returns:
            Preprocessed text
        """
        if not text:
            return text

        detected_lang = target_lang or self.detect_language(text)

        # Normalize whitespace and clean up the text
        cleaned_text = re.sub(r'\s+', ' ', text.strip())

        # Additional preprocessing based on language
        if detected_lang == 'urdu':
            # For Urdu, ensure proper RTL handling (basic preprocessing)
            # Remove any non-Urdu characters that might interfere
            cleaned_text = re.sub(r'[^\u0600-\u06FF\s\.,!?;:]', '', cleaned_text)
        elif detected_lang == 'roman_urdu':
            # For Roman Urdu, normalize common transliterations
            # Convert common variations to standard forms
            replacements = {
                'krna': 'karna',  # Standardize common variations
                'krne': 'karne',
                'krega': 'karega',
                'kregi': 'karegi',
                'hy': 'hai',
                'h': 'hai',
                'mn': 'main',
                'ap': 'aap',
                'tum': 'aap',  # Formal conversion
            }
            for old, new in replacements.items():
                cleaned_text = re.sub(r'\b' + old + r'\b', new, cleaned_text, flags=re.IGNORECASE)

        return cleaned_text

    def get_response_language(self, user_input: str, preferred_lang: str = None) -> str:
        """
        Determine the appropriate response language based on user input

        Args:
            user_input: Text input from the user
            preferred_lang: Preferred language if known (optional)

        Returns:
            Language code for the response
        """
        if preferred_lang:
            return preferred_lang

        return self.detect_language(user_input)

    def translate_response_hint(self, text: str, source_lang: str, target_lang: str) -> str:
        """
        Provide a hint for translation between supported languages.
        This is a basic implementation - in a real system you'd use a proper translation API.

        Args:
            text: Text to potentially translate
            source_lang: Source language
            target_lang: Target language

        Returns:
            Original text (placeholder - would be translated in real implementation)
        """
        # This is a placeholder - in a real implementation, you would use
        # a translation API to convert between languages
        # For now, we just return the original text
        return text