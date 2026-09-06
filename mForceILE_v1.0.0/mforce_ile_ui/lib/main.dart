import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'state/modules_provider.dart';
import 'orbital_protocol.dart';

void main() {
  initOrbital();
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: orbitalMode,
      builder: (context, mode, _) => MaterialApp(
        title: 'Interactive Learning Environment',
        themeMode: mode,
        theme: ThemeData(useMaterial3: true, brightness: Brightness.light, colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF3B82F6), brightness: Brightness.light), scaffoldBackgroundColor: const Color(0xFFF5F7FA)),
        darkTheme: ThemeData.dark(),
        home: const DashboardScreen(),
      ),
    );
  }
}

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(modulesProvider);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Interactive Learning Environment'),
      ),
      body: state.when(
        data: (items) {
          if (items.isEmpty) return const Center(child: Text('No records found'));
          return ListView.builder(
            itemCount: items.length,
            itemBuilder: (context, index) {
              final item = items[index];
              return ListTile(
                title: Text(item.title),
                subtitle: Text(item.content_jsonb),
                trailing: IconButton(
                  icon: const Icon(Icons.delete),
                  onTap: () {
                    if (item.id != null) ref.read(modulesProvider.notifier).delete(item.id!);
                  },
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, st) => Center(child: Text('Error: $err')),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          ref.read(modulesProvider.notifier).create('Test title', 'Test content_jsonb');
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
