Toxic Comment Detection with Multilingual Support

Project Overview
This project provides a system to detect toxic comments on YouTube videos, allowing users to safley use Youtube platform. The solution includes:

A deep learning model trained to identify toxic comments.

A browser extension to highlight toxic comments and make it blur for user .

Multilingual support: Comments are first translated into English before being processed by the classifier, allowing for a broader range of linguistic coverage.

🧰 Tech Stack
Backend: Python, Flask (API), TensorFlow/PyTorch (model)

Frontend: Chrome Extension (JavaScript)

Translation: Translation API

Deployment: API deployed on Render, extension available through Chrome Web Store or Developer Mode

🌍 Features
Toxic Comment Detection: Detects toxic comments with high accuracy.

Multilingual Support: Translates comments into English before processing, ensuring robustness across multiple languages.

Browser Extension: Highlights toxic comments in red and non-toxic comments in green directly on YouTube.
🔍 How It Works
User Interaction: The user browses YouTube and interacts with the extension.

Comment Processing:

The comment is first detected for its language.

If the comment isn’t in English, it is automatically translated using the Google Cloud Translation API.

Toxic Comment Detection:

The translated (or original) comment is sent to the API, where it’s processed by the trained model.

The API responds whether the comment is toxic or not.

Highlighting:

If the comment is toxic, the extension highlights it in red.

Non-toxic comments are highlighted in green.

Reporting: Toxic comments can be flagged and reported directly from the extension.

🌍 Multilingual Support
Automatic Translation: All comments are first translated into English using the Google Cloud Translation API before being processed by the classifier.

Language Detection: The system detects the language of the comment and translates it if needed.

Supported Languages: All languages supported by the Google Cloud Translation API (French, Spanish, German, Portuguese, and many more).

Author 
Prasann Trivedi
