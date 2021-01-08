clear;
clc;

macro_data = csvread('macro_test.csv',1,2);
runtime = macro_data(:,1);
workload = macro_data(:,2);
localmean = macro_data(:,3);

plot(runtime);
hold on;
set(gca,'FontName', 'Times New Roman','FontSize',18);
axis([0,1000,0,16]);
ylabel('Block generation time (second)')

yyaxis right;
plot(workload);
plot(localmean);
axis([0,1000,1e5,10e5]);
grid on;
handle = legend('Block Generation Time (second)','Workload $\mathcal{C}$','Local Average Workload $\mathcal{C}_{avg}$');
set(handle,'Interpreter','latex')
xlabel('The height of blockchain');