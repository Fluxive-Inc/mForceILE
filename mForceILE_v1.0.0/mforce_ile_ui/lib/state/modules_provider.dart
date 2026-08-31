import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/module.dart';
import '../services/api_service.dart';

class ModulesNotifier extends AsyncNotifier<List<Module>> {
  @override
  Future<List<Module>> build() async {
    return apiService.getModules();
  }

  Future<void> create(String title, String content_jsonb) async {
    state = const AsyncValue.loading();
    try {
      final newItem = await apiService.createModule(title, content_jsonb);
      state = AsyncValue.data([newItem, ...?state.value]);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> delete(int id) async {
    try {
      await apiService.deleteModule(id);
      state = AsyncValue.data(state.value?.where((item) => item.id != id).toList() ?? []);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final modulesProvider = AsyncNotifierProvider<ModulesNotifier, List<Module>>(() {
  return ModulesNotifier();
});
