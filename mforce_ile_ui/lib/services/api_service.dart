import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/module.dart';

class ApiService {
  static const String baseUrl = '/api/v1';

  Future<List<Module>> getModules() async {
    final response = await http.get(Uri.parse('$baseUrl/modules'));
    if (response.statusCode == 200) {
      final List data = jsonDecode(response.body);
      return data.map((json) => Module.fromJson(json)).toList();
    }
    throw Exception('Failed to fetch');
  }

  Future<Module> createModule(String title, String content_jsonb) async {
    final response = await http.post(
      Uri.parse('$baseUrl/modules'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'title': title,
        'content_jsonb': content_jsonb,
      }),
    );
    if (response.statusCode == 200) {
      return Module.fromJson(jsonDecode(response.body));
    }
    throw Exception('Failed to create');
  }

  Future<void> deleteModule(int id) async {
    final response = await http.delete(Uri.parse('$baseUrl/modules/$id'));
    if (response.statusCode != 200) {
      throw Exception('Failed to delete');
    }
  }
}

final apiService = ApiService();
