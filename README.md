# Zerspaner Guru

Ein übersichtlicher Schnittdatenrechner für Metallfachkräfte und Auszubildende. Die Web-App berechnet Drehzahl und Vorschubgeschwindigkeit anhand von Werkzeug, Werkstoff und Durchmesser.

## Funktionen

- Durchsuchbare Auswahl typischer Werkzeuge wie Fräser, Bohrer, Senker und Reibahlen
- Werkstoffabhängige Richtwerte, unter anderem für Stahl, Edelstahl, Aluminium und Titan
- Automatische Berechnung von Drehzahl und Vorschub
- Manuell anpassbare Schnittgeschwindigkeit und Vorschubwerte
- Direkte Rückkehr zum empfohlenen Richtwert
- Responsive Oberfläche für PC, Tablet und Smartphone

## Hinweis

Die hinterlegten Werte sind praxisnahe Startwerte. Werkzeugherstellerangaben sowie Maschine, Aufspannung, Kühlung, Auskraglänge und Bearbeitungsbedingungen haben Vorrang.

## Entwicklung

```bash
npm run install:ci
npm run dev
```

Produktions-Build:

```bash
npm run build
```

## Technik

Next.js/Vinext, React, TypeScript und Tailwind CSS.
