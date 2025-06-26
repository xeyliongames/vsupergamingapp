import {
    NgModule
} from '@angular/core';
import {
    Routes,
    RouterModule
} from '@angular/router';
const routes: Routes = [{
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        loadChildren: () =>
            import ('./home/home.module').then(m => m.homePageModule),
    },
    {
        path: 'games',
        loadChildren: () =>
            import ('./Games/Games.module').then(m => m.GamesPageModule),
    },
    {
        path: 'films',
        loadChildren: () =>
            import ('./Films/Films.module').then(m => m.FilmsPageModule),
    },
];
@NgModule({
    imports: [RouterModule.forRoot(
        routes, {
            enableTracing: false,
            useHash: true
        }
    )],
    exports: [RouterModule]
})
export class AppRoutingModule {}