// ============================================================================
// command_deck_theme.dart — CANONICAL Machineforce fleet theme (Flutter side)
//
// The Dart mirror of _shared/theme/command-deck.css. Same token values, so a
// Flutter app and a web app render the SAME Command Deck look. Lunar (dark) is
// the default; Solar (light) is the alternate, swapped by orbital_protocol.dart.
//
// Usage in main.dart (alongside the existing orbital_protocol wiring):
//   ValueListenableBuilder<ThemeMode>(
//     valueListenable: orbitalMode,
//     builder: (_, mode, __) => MaterialApp(
//       themeMode: mode,
//       theme:      CommandDeck.solar(CommandDeck.accentDefault),   // light
//       darkTheme:  CommandDeck.lunar(CommandDeck.accentDefault),   // dark (default)
//       ...));
// Per app: pass your accent, e.g. CommandDeck.lunar(const Color(0xFF34C3E0)).
// ============================================================================
import 'package:flutter/material.dart';

class CommandDeck {
  // ── Lunar (dark) grounds & surfaces ──────────────────────────────────────
  static const bg      = Color(0xFF04060A);
  static const deck    = Color(0xFF06080D);
  static const panel   = Color(0xFF0E1117);
  static const panel2  = Color(0xFF12151C);
  static const surface = Color(0xFF161A22);
  static const line    = Color(0xFF20252F);
  static const line2   = Color(0xFF2A3140);
  static const ink     = Color(0xFFE9EEF5);
  static const ink2    = Color(0xFFB4BCC9);
  static const dim     = Color(0xFFAEB7C4);
  static const mut     = Color(0xFF7E8899);

  // ── Solar (light) grounds & surfaces ─────────────────────────────────────
  static const sBg     = Color(0xFFF5F7FA);
  static const sDeck   = Color(0xFFFFFFFF);
  static const sPanel  = Color(0xFFFFFFFF);
  static const sPanel2 = Color(0xFFEEF2F7);
  static const sSurface= Color(0xFFE8EEF5);
  static const sLine   = Color(0xFFD8DEE8);
  static const sLine2  = Color(0xFFC4CDD9);
  static const sInk    = Color(0xFF0F172A);
  static const sInk2   = Color(0xFF334155);
  static const sMut    = Color(0xFF64748B);

  // ── semantic (theme-independent) ─────────────────────────────────────────
  static const ok   = Color(0xFF34D399);
  static const warn = Color(0xFFF59E0B);
  static const crit = Color(0xFFF43F5E);

  static const accentDefault = Color(0xFF3B82F6); // Fluxive blue

  static ThemeData lunar(Color accent) => _build(Brightness.dark, accent);
  static ThemeData solar(Color accent) => _build(Brightness.light, accent);

  static ThemeData _build(Brightness b, Color accent) {
    final dark = b == Brightness.dark;
    final scheme = ColorScheme.fromSeed(seedColor: accent, brightness: b).copyWith(
      primary: accent,
      surface: dark ? panel : sPanel,
      onSurface: dark ? ink : sInk,
      outline: dark ? line2 : sLine2,
      error: crit,
    );
    return ThemeData(
      useMaterial3: true,
      brightness: b,
      colorScheme: scheme,
      scaffoldBackgroundColor: dark ? bg : sBg,
      canvasColor: dark ? deck : sDeck,
      cardColor: dark ? panel : sPanel,
      dividerColor: dark ? line : sLine,
      hintColor: dark ? mut : sMut,
      fontFamily: 'Inter',
      appBarTheme: AppBarTheme(
        backgroundColor: dark ? deck : sDeck,
        foregroundColor: dark ? ink : sInk,
        elevation: 0,
      ),
      dividerTheme: DividerThemeData(color: dark ? line : sLine, thickness: 1),
    );
  }
}
