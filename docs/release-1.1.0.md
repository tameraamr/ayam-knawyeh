# Release 1.1.0 — checklist store

## Screenshot
- iPhone 6.9" (App Store, 1320×2868): `assets/store-screenshots/ios-6.9/`
- Google Play telefono (1318×2636, rapporto 2:1): `assets/store-screenshots/google-play/`
- iPad: gli screenshot iPad già presenti su App Store Connect restano validi (Apple non obbliga a cambiarli).

Ordine consigliato: 01_home → 02_categories → 03_article → 04_settings.

## "Novità di questa versione" (App Store) / "Note di rilascio" (Google Play)

```
• تصميم جديد بالكامل بألوان أيام كناوية، مع وضع ليلي
• اختر التصنيفات التي تريد أن تصلك إشعاراتها، وتصنيف جديد للوفيات
• فتح الخبر مباشرة عند الضغط على الإشعار أو على رابط مشارك
• تكبير وتصغير خط الأخبار
• زر الإبلاغ يصل الآن مباشرة إلى فريق التحرير
• تحسينات في السرعة والثبات
```

## Apple — App Privacy (App Store Connect → App → Privacy)
Rispondi **Sì, raccogliamo dati**, poi:

| Tipo di dato | Uso | Collegato all'utente? | Tracciamento? |
|---|---|---|---|
| Identificatori → **ID dispositivo** (codice anonimo generato dall'app + token notifiche) | Funzionalità dell'app, Analisi | No | No |
| Contenuti dell'utente → **Altri contenuti dell'utente** (motivo della segnalazione) | Funzionalità dell'app | No | No |
| Utilizzo → **Interazione con il prodotto** (conteggio visualizzazioni) | Analisi | No | No |

Nessun altro dato: niente nome, email, telefono, posizione, contatti, foto.

## Google Play — Sicurezza dei dati (Play Console → Contenuti dell'app → Sicurezza dei dati)
- L'app raccoglie o condivide dati? **Sì** (raccoglie; **non condivide** con terze parti).
- Crittografati in transito? **Sì** (HTTPS).
- Gli utenti possono chiedere l'eliminazione? **Sì** — disattivando le notifiche / disinstallando, o tramite la pagina contatti.
- Dati raccolti:
  - **ID dispositivo o altri ID** — Funzionalità app, Analisi — non obbligatorio per l'utente? Raccolto automaticamente.
  - **Attività nell'app → Altri contenuti generati dagli utenti** (segnalazioni) — Funzionalità app — facoltativo.
  - **Attività nell'app → Interazioni con l'app** (visualizzazioni) — Analisi.
- Privacy policy: https://ayam-knawyeh.vercel.app/privacy

## Ordine di pubblicazione
1. Backend (Railway) e admin (Vercel) — fatto prima delle build.
2. iOS: build → TestFlight → prova → App Store Connect: versione 1.1.0, scegli la build, testi, screenshot, privacy → invia in revisione.
3. Android: build AAB → Play Console, traccia test chiusi → prova → (quando possibile) produzione.
