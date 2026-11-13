import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:uuid/uuid.dart';
import '../models/account_model.dart';
import '../models/transaction_model.dart';
import '../services/api_service.dart';

class AccountProvider with ChangeNotifier {
  final ApiService _apiService;
  AccountModel? _primaryAccount;
  List<TransactionModel> _recentTransactions = [];
  bool _isLoading = false;
  String? _errorMessage;

  AccountProvider(this._apiService);

  AccountModel? get primaryAccount => _primaryAccount;
  List<TransactionModel> get recentTransactions => _recentTransactions;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchAccounts() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiService.dio.get('/api/accounts/');
      final List list = response.data is List ? response.data : response.data['results'] ?? [];
      if (list.isNotEmpty) {
        _primaryAccount = AccountModel.fromJson(list.first);
      }
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Failed to load account details.';
      notifyListeners();
    }
  }

  Future<void> fetchTransactions() async {
    try {
      final response = await _apiService.dio.get('/api/transactions/');
      final List list = response.data is List ? response.data : response.data['results'] ?? [];
      _recentTransactions = list.map((json) => TransactionModel.fromJson(json)).toList();
      notifyListeners();
    } catch (_) {}
  }

  Future<bool> executeTransfer({
    required String receiverIdentifier,
    required double amount,
    String description = '',
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    // Generate unique UUID v4 idempotency key for client-side duplicate protection
    final String idempotencyKey = const Uuid().v4();

    try {
      final response = await _apiService.dio.post(
        '/api/transactions/',
        data: {
          'receiver_identifier': receiverIdentifier.trim(),
          'amount': amount.toStringAsFixed(2),
          'description': description.trim(),
          'concurrency_strategy': 'PESSIMISTIC',
        },
        options: Options(
          headers: {
            'Idempotency-Key': idempotencyKey,
          },
        ),
      );

      // Refresh accounts & transactions after successful transfer
      await fetchAccounts();
      await fetchTransactions();

      _isLoading = false;
      notifyListeners();
      return true;
    } on DioException catch (e) {
      _isLoading = false;
      _errorMessage = e.response?.data['detail'] ??
          e.response?.data['non_field_errors']?[0] ??
          'Transfer failed. Check balance or recipient.';
      notifyListeners();
      return false;
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Unexpected transfer error.';
      notifyListeners();
      return false;
    }
  }
}
