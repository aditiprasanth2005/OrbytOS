import { collection, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db, auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';

// 📅 HELPER: Get Month Key
const getMonthKey = (timestamp: number) => {
  const d = new Date(timestamp);
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${m}-${d.getFullYear()}`;
};

export default function Analytics() {

    const [user, setUser] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [currentBudget, setCurrentBudget] = useState(null);
    const [filter, setFilter] = useState("monthly");
    const [loadingData, setLoadingData] = useState(true);

    const screenWidth = Dimensions.get("window").width;
    const currentMonthKey = getMonthKey(Date.now());

    // 🔥 REALTIME FETCH
    useEffect(() => {
        let unsubscribeExpenses;
        let unsubscribeBudget;

        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);

            if (!currentUser) {
                setExpenses([]);
                setCurrentBudget(null);
                setLoadingData(false);
                if (unsubscribeExpenses) unsubscribeExpenses();
                if (unsubscribeBudget) unsubscribeBudget();
                return;
            }

            setLoadingData(true);

            unsubscribeExpenses = onSnapshot(
                collection(db, "users", currentUser.uid, "expenses"),
                (snapshot) => {
                    const data = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setExpenses(data);
                    setLoadingData(false);
                }
            );

            const budgetRef = doc(db, "users", currentUser.uid, "budgets", currentMonthKey);
            unsubscribeBudget = onSnapshot(budgetRef, (docSnap) => {
                if (docSnap.exists()) {
                    setCurrentBudget(docSnap.data().amount);
                } else {
                    setCurrentBudget(null);
                }
            });
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeExpenses) unsubscribeExpenses();
            if (unsubscribeBudget) unsubscribeBudget();
        };
    }, []);

    // 📅 FILTER
    const filteredExpenses = expenses.filter(e => {
        const now = Date.now();
        const diff = now - e.createdAt;

        if (filter === "daily") return diff < 86400000;
        if (filter === "weekly") return diff < 604800000;
        return diff < 2592000000;
    });

    const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    const spentThisMonth = expenses
      .filter(e => getMonthKey(e.createdAt) === currentMonthKey)
      .reduce((sum, e) => sum + e.amount, 0);

    const percentage = currentBudget
      ? Math.min((spentThisMonth / currentBudget) * 100, 100)
      : 0;

    // 🎯 CATEGORY COLORS
    const categoryColors = {
        food: "#FF6B6B",
        travel: "#4ECDC4",
        shopping_need: "#4CAF50",
        shopping_want: "#F72585",
        other: "#A29BFE"
    };

    const categoryLabels = {
        food: "Food",
        travel: "Travel",
        shopping_need: "Need",
        shopping_want: "Want",
        other: "Other"
    };

    // 📊 CATEGORY TOTALS
    const categoryTotals = {};
    filteredExpenses.forEach(e => {
        categoryTotals[e.category] =
            (categoryTotals[e.category] || 0) + e.amount;
    });

    // 🧠 INSIGHT 1: Yesterday vs Today
    const todayTotal = expenses
        .filter(e => Date.now() - e.createdAt < 86400000)
        .reduce((s, e) => s + e.amount, 0);

    const yesterdayTotal = expenses
        .filter(e => {
            const diff = Date.now() - e.createdAt;
            return diff >= 86400000 && diff < 2 * 86400000;
        })
        .reduce((s, e) => s + e.amount, 0);

    let trendInsight = "Start tracking to see trends 🚀";

    if (yesterdayTotal > 0) {
        const change = ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;

        if (change > 20)
            trendInsight = `⚠️ You spent ${Math.round(change)}% more than yesterday`;
        else if (change < -20)
            trendInsight = `✅ Spending reduced by ${Math.abs(Math.round(change))}%`;
    }

    // 🧠 INSIGHT 2: Need vs Want
    const need = categoryTotals["shopping_need"] || 0;
    const want = categoryTotals["shopping_want"] || 0;

    let balanceInsight = "";

    if (need || want) {
        balanceInsight =
            want > need
                ? "🚨 Spending more on wants"
                : "✅ Good balance of needs & wants";
    }

    // 🧠 INSIGHT 3: Weekend Pattern
    const weekendSpend = expenses
        .filter(e => {
            const d = new Date(e.createdAt).getDay();
            return d === 0 || d === 6;
        })
        .reduce((s, e) => s + e.amount, 0);

    const weekdaySpend = expenses
        .filter(e => {
            const d = new Date(e.createdAt).getDay();
            return d !== 0 && d !== 6;
        })
        .reduce((s, e) => s + e.amount, 0);

    let patternInsight = "";

    if (weekendSpend > weekdaySpend) {
        patternInsight = "📈 You spend more on weekends";
    }

    // 🥧 PIE DATA
    const pieData = Object.keys(categoryTotals).map(key => ({
        name: categoryLabels[key],
        amount: categoryTotals[key],
        color: categoryColors[key],
        legendFontColor: "#fff",
        legendFontSize: 12
    }));

    // 📈 GRAPH LOGIC
    let lineLabels = [];
    let lineData = [];

    if (filter === "daily") {
        const hours = {};

        filteredExpenses.forEach(e => {
            const h = new Date(e.createdAt).getHours();
            const label = `${h}h`;
            hours[label] = (hours[label] || 0) + e.amount;
        });

        const sorted = Object.entries(hours).sort((a, b) =>
            parseInt(a[0]) - parseInt(b[0])
        );

        lineLabels = sorted.map(i => i[0]);
        lineData = sorted.map(i => i[1]);
    }

    else if (filter === "weekly") {
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const days = {};

        filteredExpenses.forEach(e => {
            const d = dayNames[new Date(e.createdAt).getDay()];
            days[d] = (days[d] || 0) + e.amount;
        });

        const sorted = dayNames.map(day => [day, days[day] || 0]);

        lineLabels = sorted.map(i => i[0]);
        lineData = sorted.map(i => i[1]);
    }

    else {
        const months = {};

        filteredExpenses.forEach(e => {
            const d = new Date(e.createdAt);
            const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
            months[key] = (months[key] || 0) + e.amount;
        });

        const sorted = Object.entries(months);

        lineLabels = sorted.map(i => i[0]);
        lineData = sorted.map(i => i[1]);
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0B132B' }}>
            <ScrollView>

                {/* HEADER */}
                <View style={{ padding: 20 }}>
                    <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>
                        📊 Analytics
                    </Text>
                </View>

                {loadingData ? (
                    <ActivityIndicator size="large" color="#6FFFE9" style={{ marginTop: 20 }} />
                ) : (
                    <>
                        {/* FILTER */}
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            marginBottom: 10
                        }}>
                            {["daily", "weekly", "monthly"].map(f => (
                                <TouchableOpacity
                                    key={f}
                                    onPress={() => setFilter(f)}
                                    style={{
                                        backgroundColor: filter === f ? '#6FFFE9' : '#1C2541',
                                        padding: 10,
                                        borderRadius: 10,
                                        margin: 5
                                    }}>
                                    <Text style={{ color: filter === f ? '#000' : '#fff' }}>
                                        {f}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* TOTAL */}
                        <Text style={{
                            color: '#6FFFE9',
                            fontSize: 26,
                            textAlign: 'center',
                            marginBottom: 10
                        }}>
                            ₹{total}
                        </Text>

                        {/* BUDGET VS SPEND */}
                        {currentBudget && (
                            <View style={{
                                marginHorizontal: 20,
                                padding: 15,
                                borderRadius: 15,
                                backgroundColor: '#1C2541',
                                alignItems: 'center'
                            }}>
                                <Text style={{ color: '#aaa', marginBottom: 5 }}>Budget vs Spend (This Month)</Text>
                                <Text style={{ color: percentage > 80 ? '#FF4D4D' : '#6FFFE9', fontSize: 16, fontWeight: 'bold' }}>
                                    You used {Math.round(percentage)}% of your monthly budget
                                </Text>
                            </View>
                        )}

                        {/* 🧠 INSIGHTS */}
                        <View style={{
                            margin: 20,
                            padding: 15,
                            borderRadius: 15,
                            backgroundColor: '#16213E'
                        }}>
                            <Text style={{ color: '#FFD93D' }}>{trendInsight}</Text>
                            {balanceInsight !== "" && (
                                <Text style={{ color: '#F72585', marginTop: 5 }}>{balanceInsight}</Text>
                            )}
                            {patternInsight !== "" && (
                                <Text style={{ color: '#6FFFE9', marginTop: 5 }}>{patternInsight}</Text>
                            )}
                        </View>

                        {/* 📈 LINE GRAPH */}
                        {lineData.length > 0 && (
                            <LineChart
                                data={{
                                    labels: lineLabels,
                                    datasets: [{ data: lineData }]
                                }}
                                width={screenWidth - 40}
                                height={220}
                                chartConfig={{
                                    backgroundColor: "#0B132B",
                                    backgroundGradientFrom: "#0B132B",
                                    backgroundGradientTo: "#0B132B",
                                    color: () => "#6FFFE9"
                                }}
                                style={{ alignSelf: 'center', borderRadius: 16 }}
                            />
                        )}

                        {/* 🥧 PIE */}
                        {pieData.length > 0 && (
                            <PieChart
                                data={pieData}
                                width={screenWidth - 40}
                                height={220}
                                chartConfig={{
                                    backgroundColor: "#0B132B",
                                    backgroundGradientFrom: "#0B132B",
                                    backgroundGradientTo: "#0B132B",
                                    color: () => "#fff"
                                }}
                                accessor="amount"
                                backgroundColor="transparent"
                                paddingLeft="10"
                            />
                        )}

                        <View style={{ height: 40 }} />
                    </>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}