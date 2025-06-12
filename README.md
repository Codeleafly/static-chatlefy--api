# Chatlefy AI Backend Server 🌐🤖

Chatlefy एक मज़बूत और सुरक्षित बैकएंड सेवा है जो Google के Gemini AI द्वारा संचालित है, जिसे संवादात्मक AI क्षमताएँ प्रदान करने के लिए डिज़ाइन किया गया है। इसमें उपयोगकर्ता-विशिष्ट चैट सेशन, दैनिक अनुरोध सीमाएँ और सुरक्षित एक्सेस कंट्रोल जैसी सुविधाएँ शामिल हैं।

## ✨ विशेषताएँ (Features)

* **Google Gemini AI इंटीग्रेशन**: शक्तिशाली संवादात्मक AI के लिए `gemini-2.5-flash-preview-05-20` मॉडल का उपयोग करता है।
* **उपयोगकर्ता-विशिष्ट चैट सेशन**: प्रत्येक `userId` के लिए इन-मेमोरी चैट इतिहास को बनाए रखता है।
* **सुरक्षित प्रथम-बार एक्सेस**: सुरक्षा बढ़ाने के लिए प्रारंभिक एक्सेस के लिए एक पूर्व-निर्धारित पासवर्ड की आवश्यकता होती है।
* **दैनिक अनुरोध दर-सीमित (Rate Limiting)**: प्रति दिन एक उपयोगकर्ता द्वारा किए जा सकने वाले AI अनुरोधों की संख्या को सीमित करता है (कॉन्फ़िगर करने योग्य)।
* **अनुकूलन योग्य सिस्टम प्रॉम्प्ट**: बाहरी `system.instruction.prompt` फ़ाइल का उपयोग करके AI व्यवहार को परिभाषित करें।
* **मजबूत लॉगिंग**: कंसोल और फ़ाइलों में व्यापक लॉगिंग के लिए `winston` का उपयोग करता है।
* **CORS प्रबंधन**: API एक्सेस को नियंत्रित करने के लिए कॉन्फ़िगर करने योग्य क्रॉस-ऑरिजन रिसोर्स शेयरिंग (CORS)।
* **पर्यावरण वेरिएबल कॉन्फ़िगरेशन**: `.env` फ़ाइल के माध्यम से आसान सेटअप।

## 🛠️ उपयोग की गई तकनीकें (Technologies Used)

* **Node.js**: अतुल्यकालिक इवेंट-ड्रिवेन जावास्क्रिप्ट रनटाइम।
* **Express.js**: Node.js के लिए तेज़, बिना राय वाला, न्यूनतम वेब फ्रेमवर्क।
* **Google Generative AI SDK**: जेमिनी मॉडलों के साथ इंटरैक्ट करने के लिए।
* **Winston**: एक बहुमुखी लॉगिंग लाइब्रेरी।
* **Dotenv**: `.env` फ़ाइल से पर्यावरण वेरिएबल्स को लोड करने के लिए।
* **CORS**: Node.js पैकेज जो एक Connect/Express मिडलवेयर प्रदान करता है जिसका उपयोग विभिन्न विकल्पों के साथ CORS को सक्षम करने के लिए किया जा सकता है।

## 🚀 शुरू करना (Getting Started)

Chatlefy बैकएंड सर्वर को सेट अप और रन करने के लिए इन चरणों का पालन करें।

### पूर्वापेक्षाएँ (Prerequisites)

सुनिश्चित करें कि आपके पास निम्नलिखित स्थापित हैं:

* [Node.js](https://nodejs.org/en/download/) (v14.x या उच्चतर अनुशंसित)
* [npm](https://www.npmjs.com/get-npm) (Node.js के साथ आता है)

### इंस्टॉलेशन (Installation)

1. **रिपॉजिटरी क्लोन करें:**
```bash
git clone <आपके-रिपॉजिटरी-का-URL>
cd <आपके-रिपॉजिटरी-का-नाम>
```

2. **डिपेंडेंसी इंस्टॉल करें:**
```bash
npm install
```

### पर्यावरण वेरिएबल 🔑 (Environment Variables)

अपनी प्रोजेक्ट डायरेक्टरी के रूट में एक `.env` फ़ाइल बनाएँ और इसे निम्नलिखित से भरें:

```env
API_KEY=आपका_GOOGLE_GEMINI_API_KEY
ENCRYPTION_KEY=आपकी_सुरक्षित_32_BYTE_एनक्रिप्टन_की
PASSWORD=आपका_सीक्रेट_पहला_यूजर_पासवर्ड
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173,https://yourfrontend.com
```

* `API_KEY`: Google AI Studio या Google Cloud से आपकी API कुंजी।
* `ENCRYPTION_KEY`: संभावित भविष्य की एन्क्रिप्शन ज़रूरतों के लिए एक मजबूत, बेतरतीब ढंग से जनरेट की गई 32-बाइट (256-बिट) कुंजी। आप इसे `node -e "console.log(crypto.randomBytes(32).toString('hex'))"` का उपयोग करके जनरेट कर सकते हैं।
* `PASSWORD`: नए `userId` के लिए चैट सेवा तक प्रारंभिक पहुँच प्राप्त करने के लिए आवश्यक पासवर्ड।
* `PORT`: पोर्ट नंबर जिस पर सर्वर चलेगा (डिफ़ॉल्ट: 3000)।
* `ALLOWED_ORIGINS`: ऑरिजन (फ्रंटएंड URL) की एक कॉमा-सेपरेटेड सूची जिन्हें CORS नीति के कारण आपकी API तक पहुँचने की अनुमति है। यदि कोई ऑरिजन निर्दिष्ट नहीं है, तो किसी भी ऑरिजन से अनुरोध CORS द्वारा अस्वीकार कर दिए जाएंगे।

### सिस्टम इंस्ट्रक्शन प्रॉम्प्ट 🧠 (System Instruction Prompt)

रूट डायरेक्टरी में `system.instruction.prompt` नाम की एक फ़ाइल बनाएँ। इस फ़ाइल में AI मॉडल के लिए सिस्टम-स्तर के निर्देश होंगे।

**उदाहरण `system.instruction.prompt`:**
```
You are Chatlefy, an AI assistant made by Smart Tell Line. You are an expert in code generation. Your default language is English, but you can communicate in any language. When generating HTML, CSS, JavaScript, ensure the user interface is professional with modern icons and symbols. Do not include your signature (Smart Tell Line or Chatlefy) in the generated code.
```
यदि यह फ़ाइल नहीं मिलती है, तो एक डिफ़ॉल्ट प्रॉम्प्ट का उपयोग किया जाएगा।

### सर्वर चलाएँ (Running the Server)

सर्वर शुरू करने के लिए, चलाएँ:

```bash
node server.js
```

आपको एक लॉग संदेश देखना चाहिए जैसे:
`[Timestamp] INFO: Chatlefy running on http://localhost:3000`

## 📡 API एंडपॉइंट (API Endpoint)

सर्वर चैट इंटरैक्शन के लिए एक सिंगल `POST` एंडपॉइंट प्रदान करता है।

### `POST /chat`

**विवरण**: AI के साथ एक चैट सेशन शुरू या जारी करता है।
**अनुरोध बॉडी (Request Body)**:
```json
{
"userId": "uniqueUserIdentifier",
"message": "Chatlefy को आपका संदेश"
}
```
* `userId` (स्ट्रिंग, **अनिवार्य**): उपयोगकर्ता के लिए एक अद्वितीय पहचानकर्ता। इसका उपयोग अलग-अलग चैट इतिहास को बनाए रखने और अनुरोधों की संख्या को ट्रैक करने के लिए किया जाता है।
* `message` (स्ट्रिंग, **अनिवार्य**): AI को भेजा गया टेक्स्ट संदेश।

**प्रथम-बार एक्सेस / प्रमाणीकरण 🔑 (First-Time Access / Authentication)**
जब एक `userId` अपना पहला संदेश भेजता है, तो `message` सामग्री **आपके `.env` फ़ाइल में परिभाषित `PASSWORD` होनी चाहिए।** यह चैट सेशन शुरू करने के लिए वन-टाइम प्रमाणीकरण के रूप में कार्य करता है।

**प्रथम-बार अनुरोध का उदाहरण (Example First-Time Request):**
```json
{
"userId": "user_alice",
"message": "आपका_सीक्रेट_पहला_यूजर_पासवर्ड"
}
```
**सफल प्रथम-बार प्रतिक्रिया (Successful First-Time Response):**
```json
{
"reply": "Access granted. You can now start chatting."
}
```
**असफल प्रथम-बार प्रतिक्रिया (Failed First-Time Response):**
```json
{
"reply": "Unauthorized access. Provide valid password."
}
}
```
**बाद के अनुरोध (Subsequent Requests):**
सफल प्रथम-बार एक्सेस के बाद, उसी `userId` से आने वाले संदेशों को AI द्वारा प्रोसेस किया जाएगा।

**बाद के अनुरोध का उदाहरण (Example Subsequent Request):**
```json
{
"userId": "user_alice",
"message": "नमस्ते Chatlefy, क्या आप मुझे लॉगिन पेज के लिए कुछ HTML बनाने में मदद कर सकते हैं?"
}
```
**सफल AI प्रतिक्रिया (Successful AI Response):**
```json
{
"reply": "निश्चित रूप से! यहाँ लॉगिन पेज के लिए कुछ बुनियादी HTML है..."
}
```

### दर सीमित करना 🚫 (Rate Limiting)

प्रत्येक `userId` प्रति 24 घंटे की अवधि में `50` अनुरोधों तक सीमित है (स्रोत कोड में `MAX_REQUESTS_PER_DAY` के माध्यम से कॉन्फ़िगर करने योग्य)। यदि सीमा पार हो जाती है, तो उपयोगकर्ता को `429 Too Many Requests` त्रुटि प्राप्त होगी।

**दर सीमा पार हुई प्रतिक्रिया (Rate Limit Exceeded Response):**
```json
{
"reply": "Rate limit exceeded for today."
}
```

### त्रुटि हैंडलिंग (Error Handling)

API में इनपुट में अमान्यता और सर्वर-साइड मुद्दों के लिए बुनियादी त्रुटि हैंडलिंग शामिल है।

* `400 Bad Request`: अनुरोध बॉडी में अमान्य `userId` या `message`।
```json
{ "reply": "Invalid input" }
```
* `403 Forbidden`: प्रथम-बार लॉग इन के दौरान अनाधिकृत पहुँच।
```json
{ "reply": "Unauthorized access. Provide valid password." }
```
* `429 Too Many Requests`: दैनिक दर सीमा पार हो गई।
```json
{ "reply": "Rate limit exceeded for today." }
```
* `500 Internal Server Error`: AI प्रोसेसिंग के दौरान एक अप्रत्याशित त्रुटि हुई।
```json
{ "reply": "Chatlefy is currently unavailable." }
```

## 🪵 लॉगिंग (Logging)

सर्वर लॉगिंग के लिए `winston` का उपयोग करता है। लॉग कंसोल में आउटपुट होते हैं और `logs/` डायरेक्टरी के भीतर फ़ाइलों में लिखे जाते हैं:

* `logs/error.log`: सभी `error` स्तर के संदेशों को रिकॉर्ड करता है।
* `logs/combined.log`: सभी `info` और उच्चतर स्तर के संदेशों को रिकॉर्ड करता है।
**Chatlefy by Smart Tell Line**
