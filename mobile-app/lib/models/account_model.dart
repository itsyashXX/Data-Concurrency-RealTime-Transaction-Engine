class AccountModel {
  final String id;
  final String accountNumber;
  final String userEmail;
  final String userName;
  final String balance;
  final String currency;
  final int version;
  final bool isActive;
  final String createdAt;

  AccountModel({
    required this.id,
    required this.accountNumber,
    required this.userEmail,
    required this.userName,
    required this.balance,
    required this.currency,
    required this.version,
    required this.isActive,
    required this.createdAt,
  });

  factory AccountModel.fromJson(Map<String, dynamic> json) {
    return AccountModel(
      id: json['id'] ?? '',
      accountNumber: json['account_number'] ?? '',
      userEmail: json['user_email'] ?? '',
      userName: json['user_name'] ?? '',
      balance: json['balance'] ?? '0.00',
      currency: json['currency'] ?? 'INR',
      version: json['version'] ?? 0,
      isActive: json['is_active'] ?? true,
      createdAt: json['created_at'] ?? '',
    );
  }
}
