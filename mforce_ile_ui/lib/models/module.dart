class Module {
  final int? id;
  final String title;
  final String content_jsonb;

  Module({this.id, required this.title, required this.content_jsonb});

  factory Module.fromJson(Map<String, dynamic> json) {
    return Module(
      id: json['id'] as int?,
      title: json['title'] as String? ?? '',
      content_jsonb: json['content_jsonb'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content_jsonb': content_jsonb,
    };
  }
}
