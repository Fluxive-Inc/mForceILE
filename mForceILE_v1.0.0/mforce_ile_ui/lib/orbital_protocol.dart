// ── Orbital Protocol ──────────────────────────────────────────────────────────
// Shared Solar (light) / Lunar (dark) theme control for every mForceOS1 app.
// Dependency-free (only dart:html + material). Compiles standalone on modern
// Flutter — dart:js_util was REMOVED in Flutter 3.41+, so this file no longer
// uses it (that import broke `flutter build web` in every app whose main reached
// this file). Lunar = dark (default) · Solar = light.
//
// The single canonical sun/moon toggle lives in the mForceLaunch shell (top-right).
// When the operator flips it, launch.js (a) toggles `body.solar-mode` on the host
// document and (b) broadcasts `MFORCE_THEME_CHANGE` (postMessage) + a
// `mforce-theme-change` window CustomEvent. This file tracks the shared toggle via
// THREE js_util-free paths: the `?theme=` seed, a MutationObserver on
// `body.solar-mode` (the reliable primary signal), and Map-only reads of the
// event/message payloads (dart:html auto-converts JSON-like detail/data to a Map).
//
// Wiring (see ORBITAL_WIRING.md):
//   1. call `initOrbital();` at the top of main() (or in a State.initState)
//   2. drive `themeMode:` from [orbitalMode] (ValueListenableBuilder or a provider),
//      providing a light (`theme:`) + dark (`darkTheme:`) pair.
import 'dart:html' as html;
import 'package:flutter/material.dart';

/// Global theme mode driven by the mForceLaunch Orbital toggle. Lunar (dark) default.
final ValueNotifier<ThemeMode> orbitalMode = ValueNotifier<ThemeMode>(ThemeMode.dark);

bool _orbitalWired = false;

void _applySolar(bool solar) {
  orbitalMode.value = solar ? ThemeMode.light : ThemeMode.dark;
}

bool _bodyIsSolar() {
  try {
    return html.document.body?.classes.contains('solar-mode') ?? false;
  } catch (_) {
    return false;
  }
}

/// Seed the theme from the `?theme=` URL param and the `body.solar-mode` class, then
/// subscribe to the launch shell's broadcasts so the app tracks the shared toggle.
/// Safe to call more than once; only the first call wires listeners.
void initOrbital() {
  if (_orbitalWired) return;
  _orbitalWired = true;

  // 1. Initial seed — launch appends ?theme=light|dark and/or sets body.solar-mode.
  try {
    final t = Uri.base.queryParameters['theme'];
    if (t == 'light' || t == 'solar') {
      orbitalMode.value = ThemeMode.light;
    } else if (t == 'dark' || t == 'lunar') {
      orbitalMode.value = ThemeMode.dark;
    } else if (_bodyIsSolar()) {
      orbitalMode.value = ThemeMode.light;
    }
  } catch (_) {}

  // 2. PRIMARY signal — watch body.solar-mode. launch.js toggles this class on every
  //    flip (manual + auto dawn/dusk); a MutationObserver is js_util-free and reliable
  //    even when an event payload does not auto-convert to a Dart Map.
  try {
    final body = html.document.body;
    if (body != null) {
      html.MutationObserver((mutations, obs) {
        _applySolar(_bodyIsSolar());
      }).observe(body, attributes: true, attributeFilter: ['class']);
    }
  } catch (_) {}

  // 3. Same-page CustomEvent 'mforce-theme-change' {detail:{solar}} — read the detail
  //    only when it auto-converts to a Map (no js interop). The MutationObserver in (2)
  //    is the fallback when it does not.
  try {
    html.window.on['mforce-theme-change'].listen((html.Event e) {
      try {
        final d = (e is html.CustomEvent) ? e.detail : null;
        if (d is Map) _applySolar(d['solar'] == true);
      } catch (_) {}
    });
  } catch (_) {}

  // 4. Cross-iframe postMessage {type:'MFORCE_THEME_CHANGE', payload:{solar}}.
  //    dart:html auto-converts JSON-like message data to a Dart Map.
  try {
    html.window.onMessage.listen((html.MessageEvent e) {
      try {
        final data = e.data;
        if (data is Map && data['type'] == 'MFORCE_THEME_CHANGE') {
          final p = data['payload'];
          if (p is Map) _applySolar(p['solar'] == true);
        }
      } catch (_) {}
    });
  } catch (_) {}
}

/// Canonical Solar/Lunar ThemeData pair (shared accent #3B82F6). Apps that theme
/// via `Theme.of(context)` can hand these straight to MaterialApp; token-based apps
/// can read [OrbitalTheme.isSolar] to swap their own palettes.
class OrbitalTheme {
  static const Color accent = Color(0xFF3B82F6);

  static bool get isSolar => orbitalMode.value == ThemeMode.light;

  static ThemeData get solar => ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        scaffoldBackgroundColor: const Color(0xFFF4F6F9),
        colorScheme: const ColorScheme.light(
          primary: accent,
          secondary: Color(0xFF7928CA),
          surface: Color(0xFFFFFFFF),
          onSurface: Color(0xFF0F172A),
          onSurfaceVariant: Color(0xFF475569),
          outline: Color(0xFFCBD5E1),
        ),
        cardTheme: const CardThemeData(
          color: Color(0xFFFFFFFF),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(3)),
            side: BorderSide(color: Color(0xFFCBD5E1), width: 1),
          ),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFFF4F6F9),
          foregroundColor: Color(0xFF0F172A),
          elevation: 0,
        ),
      );

  static ThemeData get lunar => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0B0F19),
        colorScheme: const ColorScheme.dark(
          primary: accent,
          secondary: Color(0xFFBB86FC),
          surface: Color(0xFF161C2A),
          onSurface: Color(0xFFF8FAFC),
          onSurfaceVariant: Color(0xFF94A3B8),
          outline: Color(0xFF1E293B),
        ),
        cardTheme: const CardThemeData(
          color: Color(0xFF161C2A),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(3)),
            side: BorderSide(color: Color(0xFF1E293B), width: 1),
          ),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0B0F19),
          foregroundColor: Color(0xFFF8FAFC),
          elevation: 0,
        ),
      );
}

/// Optional sun/moon toggle for STANDALONE use (app opened outside the launch
/// shell). Inside the shell the shared launch toggle is authoritative and this is
/// unnecessary — the vision keeps a single toggle in the top-right of the shell.
class OrbitalToggle extends StatelessWidget {
  const OrbitalToggle({super.key});
  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: orbitalMode,
      builder: (context, mode, _) {
        final solar = mode == ThemeMode.light;
        return IconButton(
          tooltip: solar ? 'Switch to Lunar (dark)' : 'Switch to Solar (light)',
          icon: Icon(solar ? Icons.dark_mode_rounded : Icons.light_mode_rounded),
          onPressed: () =>
              orbitalMode.value = solar ? ThemeMode.dark : ThemeMode.light,
        );
      },
    );
  }
}
