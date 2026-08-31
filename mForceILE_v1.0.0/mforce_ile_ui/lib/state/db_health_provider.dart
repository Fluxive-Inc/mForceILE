import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/api_service.dart';

final dbHealthProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return await apiService.checkHealth();
});
