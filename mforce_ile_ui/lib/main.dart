import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'state/modules_provider.dart';

void main() {
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Interactive Learning Environment',
      theme: ThemeData.dark(),
      home: const DashboardScreen(),
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
